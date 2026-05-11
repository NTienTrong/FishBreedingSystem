package com.fishbreeding.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.CustomerCancelOrderRequest;
import com.fishbreeding.backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderActionController {

    private final OrderService orderService;

    @PatchMapping("/{orderId}/customer-cancel")
    public ResponseEntity<Map<String, String>> customerCancel(
            @PathVariable Long orderId,
            @RequestBody CustomerCancelOrderRequest request,
            java.security.Principal principal) {
        String message = orderService.customerCancelOrder(orderId, principal, request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{orderId}/admin-approve-refund")
    public ResponseEntity<Map<String, String>> adminApproveRefund(@PathVariable Long orderId) {
        String message = orderService.adminApproveRefund(orderId);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
