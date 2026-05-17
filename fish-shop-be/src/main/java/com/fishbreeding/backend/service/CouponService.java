package com.fishbreeding.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.dto.AdminCouponRequest;
import com.fishbreeding.backend.dto.AdminCouponResponse;
import com.fishbreeding.backend.dto.CouponApplyResponse;
import com.fishbreeding.backend.entity.Coupon;
import com.fishbreeding.backend.entity.CouponDiscountType;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.CouponRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final com.fishbreeding.backend.service.SseService sseService;

    /**
     * Áp dụng mã giảm giá cho đơn hàng
     * @param code Mã giảm giá
     * @param orderTotal Tổng tiền đơn hàng (chưa tính shipping fee)
     * @return CouponApplyResponse chứa thông tin giảm giá
     */
    @Transactional
    public CouponApplyResponse applyCoupon(String code, BigDecimal orderTotal) {
        // Lấy mã giảm giá với pessimistic lock để chống race condition
        Coupon coupon = couponRepository.findByCodeForUpdate(code)
            .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));

        // Validate coupon
        validateCoupon(coupon, orderTotal);

        // Tính toán số tiền giảm
        BigDecimal discountAmount = calculateDiscount(coupon, orderTotal);

        // Trả về response (không tăng used_count tại đây, sẽ làm khi lưu order)
        return CouponApplyResponse.builder()
            .code(coupon.getCode())
            .discountType(coupon.getDiscountType())
            .discountValue(coupon.getDiscountValue())
            .maxDiscountAmount(coupon.getMaxDiscountAmount())
            .discountAmount(discountAmount)
            .build();
    }

    /**
     * Validate coupon có hợp lệ để sử dụng không
     */
    public void validateCoupon(Coupon coupon, BigDecimal orderTotal) {
        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra coupon có bị vô hiệu hóa
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new BadRequestException("Mã giảm giá không được kích hoạt");
        }

        // Kiểm tra thời gian hiệu lực
        if (now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa được áp dụng");
        }

        if (now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn");
        }

        // Kiểm tra đã hết lượt sử dụng
        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderTotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException(
                String.format("Đơn hàng phải đạt tối thiểu %s để áp dụng mã này", coupon.getMinOrderValue())
            );
        }
    }

    /**
     * Tính toán số tiền được giảm
     */
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderTotal) {
        BigDecimal discountAmount;

        if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
            // Giảm theo phần trăm
            discountAmount = orderTotal
                .multiply(coupon.getDiscountValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Không vượt quá max_discount_amount
            if (coupon.getMaxDiscountAmount() != null
                && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discountAmount = coupon.getMaxDiscountAmount();
            }
        } else {
            // Giảm theo số tiền cố định
            discountAmount = coupon.getDiscountValue().min(orderTotal);
        }

        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Tăng lượt sử dụng của coupon (gọi khi order thành công)
     */
    @Transactional
    public void incrementUsedCount(String couponCode) {
        // Sử dụng pessimistic lock để chống race condition
        Coupon coupon = couponRepository.findByCodeForUpdate(couponCode)
            .orElseThrow(() -> new BadRequestException("Coupon not found"));

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        // emit coupon used event for admin dashboard
        try {
            var payload = Map.of(
                "code", coupon.getCode(),
                "usedCount", coupon.getUsedCount(),
                "usageLimit", coupon.getUsageLimit()
            );
            sseService.emit("coupon", "update", payload);
        } catch (Exception ex) {
            // ignore
        }
    }

    /**
     * Tạo mã giảm giá mới (Admin API)
     */
    @Transactional
    public AdminCouponResponse createCoupon(AdminCouponRequest request) {
        // Validate startDate < endDate
        if (request.getStartDate().isAfter(request.getEndDate()) ||
            request.getStartDate().isEqual(request.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // Kiểm tra code đã tồn tại
        if (couponRepository.findByCodeIgnoreCase(request.getCode()).isPresent()) {
            throw new BadRequestException("Mã giảm giá đã tồn tại");
        }

        Coupon coupon = Coupon.builder()
            .code(request.getCode().toUpperCase().trim())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .minOrderValue(request.getMinOrderValue())
            .maxDiscountAmount(request.getMaxDiscountAmount())
            .usageLimit(request.getUsageLimit())
            .usedCount(0)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .isActive(request.getIsActive())
            .build();

        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    /**
     * Lấy danh sách tất cả mã giảm giá (Admin API)
     * @param page Trang (0-indexed)
     * @param size Số lượng mỗi trang
     */
    public Page<AdminCouponResponse> getCoupons(int page, int size) {
        Page<Coupon> coupons = couponRepository.findAll(
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return coupons.map(this::mapToResponse);
    }

    /**
     * Lấy chi tiết mã giảm giá theo ID (Admin API)
     */
    public AdminCouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));
        return mapToResponse(coupon);
    }

    /**
     * Cập nhật mã giảm giá (Admin API)
     */
    @Transactional
    public AdminCouponResponse updateCoupon(Long id, AdminCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));

        // Validate startDate < endDate
        if (request.getStartDate().isAfter(request.getEndDate()) ||
            request.getStartDate().isEqual(request.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // Nếu đổi code, kiểm tra code mới đã tồn tại chưa
        String newCode = request.getCode().toUpperCase().trim();
        if (!coupon.getCode().equalsIgnoreCase(newCode)) {
            if (couponRepository.findByCodeIgnoreCase(newCode).isPresent()) {
                throw new BadRequestException("Mã giảm giá đã tồn tại");
            }
        }

        coupon.setCode(newCode);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setIsActive(request.getIsActive());

        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    /**
     * Xóa mã giảm giá (Admin API)
     */
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));
        couponRepository.delete(coupon);
    }

    /**
     * Bật/tắt trạng thái mã giảm giá (Admin API)
     */
    @Transactional
    public AdminCouponResponse toggleCouponStatus(Long id, Boolean isActive) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Mã giảm giá không tồn tại"));

        coupon.setIsActive(isActive);
        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    /**
     * Map Coupon entity sang AdminCouponResponse DTO
     */
    private AdminCouponResponse mapToResponse(Coupon coupon) {
        return AdminCouponResponse.builder()
            .id(coupon.getId())
            .code(coupon.getCode())
            .discountType(coupon.getDiscountType())
            .discountValue(coupon.getDiscountValue())
            .minOrderValue(coupon.getMinOrderValue())
            .maxDiscountAmount(coupon.getMaxDiscountAmount())
            .usageLimit(coupon.getUsageLimit())
            .usedCount(coupon.getUsedCount())
            .startDate(coupon.getStartDate())
            .endDate(coupon.getEndDate())
            .isActive(coupon.getIsActive())
            .createdAt(coupon.getCreatedAt())
            .build();
    }
}
