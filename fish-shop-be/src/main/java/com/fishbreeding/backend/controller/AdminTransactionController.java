package com.fishbreeding.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.AdminTransactionResponse;
import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.VnpayTransaction;
import com.fishbreeding.backend.repository.VnpayTransactionRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class AdminTransactionController {

    private final VnpayTransactionRepository vnpayTransactionRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminTransactionResponse>> listTransactions() {
        List<VnpayTransaction> transactions = vnpayTransactionRepository
            .findAllByOrderByCreatedAtDescIdDesc();
        List<AdminTransactionResponse> responses = new ArrayList<>();

        for (VnpayTransaction transaction : transactions) {
            Order order = transaction.getOrder();
            responses.add(AdminTransactionResponse.builder()
                .id(transaction.getId())
                .orderId(order != null ? order.getId() : null)
                .orderCode(order != null ? order.getOrderCode() : null)
                .orderStatus(order != null ? order.getOrderStatus() : null)
                .paymentStatus(order != null ? order.getPaymentStatus() : null)
                .vnpTxnRef(transaction.getVnpTxnRef())
                .vnpTransactionNo(transaction.getVnpTransactionNo())
                .vnpResponseCode(transaction.getVnpResponseCode())
                .vnpAmount(transaction.getVnpAmount())
                .vnpBankCode(transaction.getVnpBankCode())
                .vnpPayDate(transaction.getVnpPayDate())
                .createdAt(transaction.getCreatedAt())
                .rawResponse(transaction.getVnpRawResponse())
                .build());
        }

        return ResponseEntity.ok(responses);
    }
}
