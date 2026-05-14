package com.fishbreeding.backend.controller;

import java.security.Principal;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.AdminCouponRequest;
import com.fishbreeding.backend.dto.AdminCouponResponse;
import com.fishbreeding.backend.dto.CouponApplyRequest;
import com.fishbreeding.backend.dto.CouponApplyResponse;
import com.fishbreeding.backend.service.CouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class CouponController {

    private final CouponService couponService;

    /**
     * Customer API: Áp dụng mã giảm giá
     * POST /api/v1/coupons/apply
     * 
     * @param request Chứa code và orderTotal
     * @return CouponApplyResponse với discountAmount
     */
    @PostMapping("/coupons/apply")
    public ResponseEntity<CouponApplyResponse> applyCoupon(
            @Valid @RequestBody CouponApplyRequest request) {
        log.info("Applying coupon: {}", request.getCode());
        CouponApplyResponse response = couponService.applyCoupon(request.getCode(), request.getOrderTotal());
        return ResponseEntity.ok(response);
    }

    // ==================== ADMIN APIs ====================

    /**
     * Admin API: Tạo mã giảm giá mới
     * POST /api/v1/admin/coupons
     * 
     * @param request AdminCouponRequest chứa thông tin mã
     * @return AdminCouponResponse
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/coupons")
    public ResponseEntity<AdminCouponResponse> createCoupon(
            @Valid @RequestBody AdminCouponRequest request) {
        log.info("Creating coupon: {}", request.getCode());
        AdminCouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Admin API: Lấy danh sách tất cả mã giảm giá
     * GET /api/v1/admin/coupons
     * 
     * @param page Trang (0-indexed)
     * @param size Số lượng mỗi trang
     * @return Page<AdminCouponResponse>
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/coupons")
    public ResponseEntity<Page<AdminCouponResponse>> getCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching coupons - page: {}, size: {}", page, size);
        Page<AdminCouponResponse> response = couponService.getCoupons(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin API: Bật/tắt trạng thái mã giảm giá
     * PATCH /api/v1/admin/coupons/{id}/status
     * 
     * @param id ID của coupon
     * @param isActive Trạng thái bật/tắt
     * @return AdminCouponResponse
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/coupons/{id}/status")
    public ResponseEntity<AdminCouponResponse> toggleCouponStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        log.info("Toggling coupon status - id: {}, isActive: {}", id, isActive);
        AdminCouponResponse response = couponService.toggleCouponStatus(id, isActive);
        return ResponseEntity.ok(response);
    }
}
