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

import com.fishbreeding.backend.dto.CustomerCheckoutRequest;
import com.fishbreeding.backend.dto.CustomerCheckoutResponse;
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
    private final InventoryService inventoryService;

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

        BigDecimal totalAmount = cartItems.stream()
            .map(i -> i.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);

        String paymentMethod = request.getPaymentMethod();
        String orderStatus = "VNPAY".equals(paymentMethod)
                ? "pending_payment"
                : "pending_confirmation";

        Order order = orderRepository.save(Order.builder()
                .user(user)
                .orderCode(generateOrderCode())
                .totalAmount(totalAmount)
                .orderStatus(orderStatus)
                .paymentStatus(0)
                .paymentMethod(paymentMethod)
                .recipientName(request.getFullName())
                .recipientPhone(request.getPhone())
                .shippingAddress(request.getAddress())
                .orderNote(StringUtils.hasText(request.getNote()) ? request.getNote().trim() : null)
                .build());

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

        // Clear cart
        cartItemRepository.deleteByUser_Id(user.getId());

        String paymentUrl = null;
        String message;

        if ("VNPAY".equals(paymentMethod)) {
            paymentUrl = buildPaymentUrl(order);
            message = "Đang chuyển sang VNPay...";
        } else {
            message = "Đơn COD đã tạo thành công";
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

        if (success) {
            if (order.getPaymentStatus() != null && order.getPaymentStatus() == 1) {
                return new CallbackResult(true, orderCode, "Thanh toán đã được ghi nhận", null);
            }

            try {
                List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
                for (OrderItem item : items) {
                    inventoryService.deductStock(
                        item.getProduct().getId(),
                        item.getQuantity(),
                        "Đơn hàng " + order.getOrderCode());
                }

                order.setPaymentStatus(1);
                order.setOrderStatus("paid");
            } catch (BadRequestException ex) {
                order.setPaymentStatus(2);
                order.setOrderStatus("stock_issue");
                orderRepository.save(order);
                return new CallbackResult(false, orderCode,
                        "Thanh toán thành công nhưng tồn kho không đủ", null);
            }
        } else {
            order.setPaymentStatus(2);
            order.setOrderStatus("failed");
        }

        orderRepository.save(order);

        return new CallbackResult(success, orderCode,
            success ? "Thanh toán thành công" : "Thanh toán thất bại", null);
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
                hex.append(String.format("%02x", b));
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