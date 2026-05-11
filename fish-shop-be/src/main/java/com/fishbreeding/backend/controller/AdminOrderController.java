package com.fishbreeding.backend.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.AdminOrderItemResponse;
import com.fishbreeding.backend.dto.AdminOrderResponse;
import com.fishbreeding.backend.dto.AdminOrderStatusRequest;
import com.fishbreeding.backend.entity.OrderStatus;
import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.OrderItem;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.OrderItemRepository;
import com.fishbreeding.backend.repository.OrderRepository;
import com.fishbreeding.backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderService orderService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminOrderResponse>> listOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDescIdDesc();
        List<AdminOrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(mapOrder(order));
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{orderId}")
    @Transactional(readOnly = true)
    public ResponseEntity<AdminOrderResponse> getOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findWithUserById(orderId)
            .orElseThrow(() -> new BadRequestException("Order not found"));
        return ResponseEntity.ok(mapOrder(order));
    }

    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(
        @PathVariable Long orderId,
        @RequestBody AdminOrderStatusRequest request) {
        if (request == null || request.getOrderStatus() == null) {
            throw new BadRequestException("Order status is required");
        }

        Order updated = orderService.updateOrderStatus(orderId, request.getOrderStatus());
        return ResponseEntity.ok(mapOrder(updated));
    }

    private AdminOrderResponse mapOrder(Order order) {
        List<OrderItem> items = order.getItems();
        List<AdminOrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem item : items) {
            BigDecimal price = item.getPriceAtPurchase();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            itemResponses.add(AdminOrderItemResponse.builder()
                .productId(item.getProduct().getId())
                .name(item.getProduct().getName())
                .sku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .price(price)
                .lineTotal(lineTotal)
                .build());
        }

        User user = order.getUser();
        return AdminOrderResponse.builder()
            .id(order.getId())
            .orderCode(order.getOrderCode())
            .orderStatus(order.getOrderStatus())
            .paymentStatus(order.getPaymentStatus())
            .paymentMethod(order.getPaymentMethod())
            .totalAmount(order.getTotalAmount())
            .shippingFee(order.getShippingFee())
            .createdAt(order.getCreatedAt())
            .recipientName(order.getRecipientName())
            .recipientPhone(order.getRecipientPhone())
            .shippingAddress(order.getShippingAddress())
            .orderNote(order.getOrderNote())
            .cancelReason(order.getCancelReason())
            .customerId(user != null ? user.getId() : null)
            .customerName(user != null ? user.getFullName() : null)
            .customerEmail(user != null ? user.getEmail() : null)
            .customerPhone(user != null ? user.getPhone() : null)
            .items(itemResponses)
            .build();
    }
}
