package com.fishbreeding.backend.service;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.OrderItem;
import com.fishbreeding.backend.entity.OrderStatus;
import com.fishbreeding.backend.entity.PaymentMethod;
import com.fishbreeding.backend.entity.PaymentStatus;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.OrderRepository;
import com.fishbreeding.backend.dto.CustomerCancelOrderRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final TransactionService transactionService;
    private final VnpayCheckoutService vnpayCheckoutService;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = buildTransitions();

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus nextStatus, String ghnOrderCode) {
        Order order = orderRepository.findWithUserById(orderId)
            .orElseThrow(() -> new BadRequestException("Order not found"));

        OrderStatus currentStatus = order.getOrderStatus();
        if (currentStatus == OrderStatus.PENDING_PAYMENT || currentStatus == OrderStatus.PENDING_REFUND) {
            throw new BadRequestException("Đơn đang chờ thanh toán/hoàn tiền, không thể thao tác.");
        }

        if (currentStatus == nextStatus) {
            return order;
        }

        if (!isTransitionAllowed(currentStatus, nextStatus)) {
            throw new BadRequestException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + nextStatus);
        }

        order.setOrderStatus(nextStatus);

        if (nextStatus == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            transactionService.createCodTransaction(order, ghnOrderCode);
        }

        if (nextStatus == OrderStatus.CANCELLED) {
            handleRestockIfNeeded(order);
            order.setPaymentStatus(order.getPaymentMethod() == PaymentMethod.VNPAY ? PaymentStatus.FAILED : PaymentStatus.UNPAID);
        }

        return orderRepository.save(order);
    }

    private void handleRestockIfNeeded(Order order) {
        if (!Boolean.TRUE.equals(order.getStockDeducted())) {
            return;
        }

        for (OrderItem item : order.getItems()) {
            inventoryService.restock(
                item.getProduct().getId(),
                item.getQuantity(),
                "Hủy đơn hàng " + order.getOrderCode());
        }

        order.setStockDeducted(false);
    }

    @Transactional
    public String customerCancelOrder(Long orderId, java.security.Principal principal, CustomerCancelOrderRequest request) {
        if (principal == null || principal.getName() == null) {
            throw new BadRequestException("Unauthorized");
        }

        Order order = orderRepository.findWithUserById(orderId)
            .orElseThrow(() -> new BadRequestException("Order not found"));

        if (order.getUser() == null || !principal.getName().equals(order.getUser().getUsername())) {
            throw new BadRequestException("Unauthorized");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn khi đang chờ xác nhận");
        }

        String cancelReason = request != null ? request.getCancelReason() : null;
        order.setCancelReason(cancelReason != null ? cancelReason.trim() : null);

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus(PaymentStatus.UNPAID);
            handleRestockIfNeeded(order);
            orderRepository.save(order);
            return "Hủy đơn thành công";
        }

        if (order.getPaymentMethod() == PaymentMethod.VNPAY && order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setOrderStatus(OrderStatus.PENDING_REFUND);
            orderRepository.save(order);
            return "Đã gửi yêu cầu hoàn tiền, vui lòng chờ Admin xử lý";
        }

        throw new BadRequestException("Đơn hàng không đủ điều kiện để hủy");
    }

    @Transactional
    public String adminApproveRefund(Long orderId) {
        Order order = orderRepository.findWithUserById(orderId)
            .orElseThrow(() -> new BadRequestException("Order not found"));

        if (order.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new BadRequestException("Chỉ hỗ trợ hoàn tiền cho đơn VNPay");
        }

        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Đơn hàng chưa thanh toán thành công");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING_REFUND
                && order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Đơn hàng không đủ điều kiện để hoàn tiền");
        }

        var refundResult = vnpayCheckoutService.refundPayment(order, "admin", null);
        transactionService.createVnpayRefundTransaction(
            order,
            order.getOrderCode(),
            order.getTotalAmount(),
            refundResult.success());

        if (!refundResult.success()) {
            order.setOrderStatus(OrderStatus.PENDING_REFUND);
            orderRepository.save(order);
            String responseCode = refundResult.responseCode() != null ? refundResult.responseCode() : "N/A";
            String message = refundResult.message() != null ? refundResult.message() : "Hoàn tiền thất bại";
            return "Hoàn tiền thất bại (" + responseCode + "): " + message;
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        handleRestockIfNeeded(order);
        orderRepository.save(order);
        return "Đã hoàn tiền thành công và hủy đơn";
    }

    private static boolean isTransitionAllowed(OrderStatus current, OrderStatus next) {
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.get(current);
        return allowed != null && allowed.contains(next);
    }

    private static Map<OrderStatus, Set<OrderStatus>> buildTransitions() {
        Map<OrderStatus, Set<OrderStatus>> map = new EnumMap<>(OrderStatus.class);
        map.put(OrderStatus.PENDING, EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        map.put(OrderStatus.PROCESSING, EnumSet.of(OrderStatus.DELIVERING, OrderStatus.CANCELLED));
        map.put(OrderStatus.DELIVERING, EnumSet.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED));
        map.put(OrderStatus.COMPLETED, EnumSet.noneOf(OrderStatus.class));
        map.put(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));
        map.put(OrderStatus.PENDING_PAYMENT, EnumSet.of(OrderStatus.CANCELLED));
        map.put(OrderStatus.PENDING_REFUND, EnumSet.noneOf(OrderStatus.class));
        return map;
    }
}
