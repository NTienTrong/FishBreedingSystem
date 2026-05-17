package com.fishbreeding.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fishbreeding.backend.dto.CustomerCheckoutRequest;
import com.fishbreeding.backend.dto.CustomerCheckoutResponse;
import com.fishbreeding.backend.dto.ghn.GhnShippingFeeResponse;
import com.fishbreeding.backend.entity.*;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayCheckoutService {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final VnpayTransactionRepository vnpayTransactionRepository;
    private final TransactionService transactionService;
    private final SseService sseService;
    private final InventoryService inventoryService;
    private final GhnLocationService ghnLocationService;
    private final CouponService couponService;
    private final ObjectMapper objectMapper;

    @Value("${app.vnpay.tmn-code:}")
    private String tmnCode;

    @Value("${app.vnpay.hash-secret:}")
    private String hashSecret;

    @Value("${app.vnpay.pay-url:}")
    private String payUrl;

    @Value("${app.vnpay.return-url:}")
    private String returnUrl;

    @Value("${app.vnpay.frontend-return-url:}")
    private String frontendReturnUrl;

    @Value("${app.vnpay.version:2.1.0}")
    private String version;

    @Value("${app.vnpay.command:pay}")
    private String command;

    @Value("${app.vnpay.curr-code:VND}")
    private String currCode;

    @Value("${app.vnpay.locale:vn}")
    private String locale;

    @Value("${app.vnpay.order-type:other}")
    private String orderType;

    // ================== CHECKOUT ==================

    @Transactional
    public CustomerCheckoutResponse createCheckout(String username, CustomerCheckoutRequest request) {

        User user = requireUser(username);

        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProduct(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        for (CartItem cartItem : cartItems) {
            boolean available = inventoryService.checkAvailability(cartItem.getProduct().getId(), cartItem.getQuantity());
            if (!available) {
                throw new BadRequestException("Sản phẩm " + cartItem.getProduct().getName() + " không đủ tồn kho");
            }
        }

        // Calculate subtotal (product amount)
        BigDecimal subtotal = cartItems.stream()
            .map(i -> i.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

        // Apply coupon discount if provided
        String couponCode = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getCouponCode())) {
            try {
                var couponResponse = couponService.applyCoupon(request.getCouponCode().trim(), subtotal);
                couponCode = couponResponse.getCode();
                discountAmount = couponResponse.getDiscountAmount();
                log.info("Coupon applied: {}, discount: {}", couponCode, discountAmount);
            } catch (Exception ex) {
                log.warn("Coupon validation failed: {}", ex.getMessage());
                // Không throw exception, cho phép checkout tiếp tục mà không giảm giá
                // Frontend có thể hiển thị cảnh báo cho user
            }
        }

        // Calculate shipping fee from GHN API
        BigDecimal shippingFee = calculateShippingFee(request);

        // Total amount = subtotal - discount + shipping fee
        BigDecimal totalAmount = subtotal
            .subtract(discountAmount)
            .add(shippingFee)
            .setScale(2, RoundingMode.HALF_UP);

        PaymentMethod paymentMethod = parsePaymentMethod(request.getPaymentMethod());
        OrderStatus orderStatus = paymentMethod == PaymentMethod.VNPAY
            ? OrderStatus.PENDING_PAYMENT
            : OrderStatus.PENDING;

        Order order = orderRepository.save(Order.builder()
                .user(user)
                .orderCode(generateOrderCode())
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .orderStatus(orderStatus)
                .paymentStatus(PaymentStatus.UNPAID)
                .paymentMethod(paymentMethod)
                .recipientName(request.getFullName())
                .recipientPhone(request.getPhone())
            .shippingAddress(buildShippingAddress(request))
                .orderNote(StringUtils.hasText(request.getNote()) ? request.getNote().trim() : null)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .build());

        // Emit lightweight order event for user/admin
        try {
            var orderPayload = Map.of(
                "orderId", order.getId(),
                "orderCode", order.getOrderCode(),
                "orderStatus", order.getOrderStatus(),
                "paymentStatus", order.getPaymentStatus(),
                "paymentMethod", order.getPaymentMethod(),
                "totalAmount", order.getTotalAmount()
            );
            sseService.emit("order:" + order.getOrderCode(), "orderCreated", orderPayload);
            sseService.emit("admin", "orderCreated", orderPayload);
        } catch (Exception ex) {
            // ignore SSE errors
        }

        // Save items
        List<OrderItem> items = new ArrayList<>();
        for (CartItem c : cartItems) {
            items.add(OrderItem.builder()
                    .id(new OrderItemId(order.getId(), c.getProduct().getId()))
                    .order(order)
                    .product(c.getProduct())
                    .quantity(c.getQuantity())
                    .priceAtPurchase(c.getProduct().getPrice())
                    .build());
        }
        orderItemRepository.saveAll(items);

        // Increment coupon usage count if coupon was applied
        if (StringUtils.hasText(couponCode)) {
            couponService.incrementUsedCount(couponCode);
        }

        // For COD: deduct stock immediately
        if (paymentMethod == PaymentMethod.COD) {
            try {
                for (OrderItem item : items) {
                    inventoryService.deductStock(
                        item.getProduct().getId(),
                        item.getQuantity(),
                        "Đơn hàng " + order.getOrderCode());
                }
                order.setStockDeducted(true);
                orderRepository.save(order);
            } catch (BadRequestException ex) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                throw new BadRequestException("Không đủ tồn kho để xử lý đơn hàng COD: " + ex.getMessage());
            }
        }

        // Clear cart
        cartItemRepository.deleteByUser_Id(user.getId());

        String paymentUrl = null;
        String message;

        if (paymentMethod == PaymentMethod.VNPAY) {
            paymentUrl = buildPaymentUrl(order);
            message = "Đang chuyển sang VNPay...";
        } else {
            message = "Đơn COD đã tạo thành công. Bạn sẽ thanh toán khi nhận hàng.";
        }

        return CustomerCheckoutResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .paymentUrl(paymentUrl)
                .totalAmount(totalAmount)
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .vnpayConfigured(paymentUrl != null)
                .message(message)
                .build();
    }

    private BigDecimal calculateShippingFee(CustomerCheckoutRequest request) {
        try {
            if (request.getDistrictId() == null || request.getDistrictId() <= 0) {
                log.warn("District ID not provided or invalid, using default shipping fee");
                return BigDecimal.valueOf(45000); // Default fee
            }

            GhnShippingFeeResponse feeResponse = ghnLocationService.calculateShippingFee(
                request.getDistrictId(),
                request.getWardCode(),
                1000);
            if (feeResponse != null && feeResponse.getTotal() > 0) {
                return BigDecimal.valueOf(feeResponse.getTotal());
            }

            log.warn("GHN API returned invalid fee, using default shipping fee");
            return BigDecimal.valueOf(45000);
        } catch (Exception ex) {
            log.error("Failed to calculate shipping fee from GHN API: {}", ex.getMessage(), ex);
            return BigDecimal.valueOf(45000); // Fallback to default fee
        }
    }

    private String buildShippingAddress(CustomerCheckoutRequest request) {
        List<String> parts = new ArrayList<>();
        if (StringUtils.hasText(request.getAddress())) {
            parts.add(request.getAddress().trim());
        }
        if (StringUtils.hasText(request.getWard())) {
            parts.add(request.getWard().trim());
        }
        if (StringUtils.hasText(request.getDistrict())) {
            parts.add(request.getDistrict().trim());
        }
        if (StringUtils.hasText(request.getProvince())) {
            parts.add(request.getProvince().trim());
        }
        return String.join(", ", parts);
    }

    // ================== BUILD URL ==================

    private String buildPaymentUrl(Order order) {

        if (!hasCredentials())
            return null;

        long vnpAmount = order.getTotalAmount()
            .setScale(2, RoundingMode.HALF_UP)
            .movePointRight(2)
            .longValueExact();

        String txnRef = order.getOrderCode();
        String createDate = LocalDateTime.now().format(VNPAY_DATE_FORMAT);
        String expireDate = LocalDateTime.now().plusMinutes(15).format(VNPAY_DATE_FORMAT);

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", version);
        params.put("vnp_Command", command);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(vnpAmount));
        params.put("vnp_CurrCode", currCode);
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + txnRef);
        params.put("vnp_OrderType", orderType);
        params.put("vnp_Locale", locale);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<Map.Entry<String, String>> it = params.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, String> entry = it.next();

                String key = entry.getKey();
                String value = entry.getValue();

                // VNPay expects keys as plain text and values URL-encoded (spaces as %20)
                String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");

                hashData.append(key)
                    .append("=")
                    .append(encodedValue);

                query.append(key)
                    .append("=")
                    .append(encodedValue);

            if (it.hasNext()) {
                hashData.append("&");
                query.append("&");
            }
        }

        String secureHash = hmacSHA512(hashSecret, hashData.toString());

        log.debug("VNPay hashData={} secureHash={}", hashData.toString(), secureHash);

        return payUrl + "?" + query +
            "&vnp_SecureHashType=HmacSHA512&vnp_SecureHash=" + secureHash;
    }

    // ================== CALLBACK ==================

    private CallbackResult handleCallback(Map<String, String> params) {

        if (!isValidSignature(params)) {
            return new CallbackResult(false, null, "Invalid signature", null);
        }

        String orderCode = params.get("vnp_TxnRef");

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        boolean success = "00".equals(params.get("vnp_ResponseCode"));
        recordTransaction(order, params);

        if (success) {
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                return new CallbackResult(true, orderCode, "Thanh toán đã được ghi nhận", null);
            }

            try {
                if (!Boolean.TRUE.equals(order.getStockDeducted())) {
                    List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
                    for (OrderItem item : items) {
                        inventoryService.deductStock(
                            item.getProduct().getId(),
                            item.getQuantity(),
                            "Đơn hàng " + order.getOrderCode());
                    }
                    order.setStockDeducted(true);
                }

                order.setPaymentStatus(PaymentStatus.PAID);
                order.setOrderStatus(OrderStatus.PENDING);
            } catch (BadRequestException ex) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                return new CallbackResult(false, orderCode,
                        "Thanh toán thành công nhưng tồn kho không đủ", null);
            }
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);

        // Emit order update
        try {
            var orderPayload = Map.of(
                "orderId", order.getId(),
                "orderCode", order.getOrderCode(),
                "orderStatus", order.getOrderStatus(),
                "paymentStatus", order.getPaymentStatus(),
                "paymentMethod", order.getPaymentMethod(),
                "totalAmount", order.getTotalAmount()
            );
            sseService.emit("order:" + order.getOrderCode(), "orderUpdate", orderPayload);
            sseService.emit("admin", "orderUpdate", orderPayload);
        } catch (Exception ex) {
            // ignore
        }

        return new CallbackResult(success, orderCode,
            success ? "Thanh toán thành công" : "Thanh toán thất bại", null);
    }

    private void recordTransaction(Order order, Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        if (!StringUtils.hasText(txnRef)) {
            return;
        }

        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);
        BigDecimal amount = parseVnpAmount(params.get("vnp_Amount"));
        String referenceCode = StringUtils.hasText(params.get("vnp_TransactionNo"))
            ? params.get("vnp_TransactionNo")
            : txnRef;

        transactionService.createVnpayTransaction(order, referenceCode, amount, success);

        VnpayTransaction transaction = vnpayTransactionRepository.findByVnpTxnRef(txnRef)
            .orElseGet(VnpayTransaction::new);

        transaction.setOrder(order);
        transaction.setVnpTxnRef(txnRef);
        transaction.setVnpTransactionNo(params.get("vnp_TransactionNo"));
        transaction.setVnpResponseCode(responseCode);
        transaction.setVnpBankCode(params.get("vnp_BankCode"));
        transaction.setVnpAmount(amount);
        transaction.setVnpPayDate(parseVnpPayDate(params.get("vnp_PayDate")));
        transaction.setVnpRawResponse(objectMapper.valueToTree(params));

        vnpayTransactionRepository.save(transaction);
    }

    private BigDecimal parseVnpAmount(String amount) {
        if (!StringUtils.hasText(amount)) {
            return null;
        }

        try {
            BigDecimal raw = new BigDecimal(amount);
            return raw.movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private LocalDateTime parseVnpPayDate(String payDate) {
        if (!StringUtils.hasText(payDate)) {
            return null;
        }

        try {
            return LocalDateTime.parse(payDate, VNPAY_DATE_FORMAT);
        } catch (Exception ex) {
            return null;
        }
    }

    // ================== SIGNATURE ==================

    private boolean isValidSignature(Map<String, String> params) {

        String provided = params.get("vnp_SecureHash");

        Map<String, String> filtered = new TreeMap<>();
        params.forEach((k, v) -> {
            if (!"vnp_SecureHash".equals(k)
                    && !"vnp_SecureHashType".equals(k)
                    && v != null) {
                filtered.put(k, v);
            }
        });

        StringBuilder hashData = new StringBuilder();

        Iterator<Map.Entry<String, String>> it = filtered.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, String> entry = it.next();

                String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8).replace("+", "%20");
                hashData.append(entry.getKey())
                    .append("=")
                    .append(encodedValue);

            if (it.hasNext())
                hashData.append("&");
        }

        String calculated = hmacSHA512(hashSecret, hashData.toString());

        log.debug("VNPay verify provided={} calculated={} data={}", provided, calculated, hashData.toString());

        return calculated.equalsIgnoreCase(provided);
    }

    // ================== UTILS ==================

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));

            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02X", b));
            }

            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private boolean hasCredentials() {
        return StringUtils.hasText(tmnCode)
                && StringUtils.hasText(hashSecret)
                && StringUtils.hasText(payUrl)
                && StringUtils.hasText(returnUrl);
    }

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private String generateOrderCode() {
        return "ORD" + System.currentTimeMillis();
    }

    private PaymentMethod parsePaymentMethod(String method) {
        if (!StringUtils.hasText(method)) {
            throw new BadRequestException("Payment method is required");
        }

        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid payment method: " + method);
        }
    }

    // ================== RETURN ==================

    public record CallbackResult(boolean success, String orderCode, String message, String redirectUrl) {
    }

    @Transactional
    public CallbackResult handleReturn(Map<String, String> params) {

        CallbackResult result = handleCallback(params);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendReturnUrl)
                .queryParam("status", result.success() ? "success" : "failed")
                .queryParam("orderCode", result.orderCode())
                .build()
                .toUriString();

        return new CallbackResult(
                result.success(),
                result.orderCode(),
                result.message(),
                redirectUrl);
    }

    @Transactional
    public CallbackResult handleIpn(Map<String, String> params) {
        return handleCallback(params);
    }
}