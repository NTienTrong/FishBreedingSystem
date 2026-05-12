package com.fishbreeding.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.AdminTransactionResponse;
import com.fishbreeding.backend.dto.TransactionSummaryResponse;
import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.Transaction;
import com.fishbreeding.backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class AdminTransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AdminTransactionResponse>> listTransactions() {
        List<Transaction> transactions = transactionRepository
            .findAllByOrderByCreatedAtDescIdDesc();
        List<AdminTransactionResponse> responses = new ArrayList<>();

        for (Transaction transaction : transactions) {
            Order order = transaction.getOrder();
            responses.add(AdminTransactionResponse.builder()
                .id(transaction.getId())
                .orderId(order != null ? order.getId() : null)
                .orderCode(order != null ? order.getOrderCode() : null)
                .orderStatus(order != null ? order.getOrderStatus() : null)
                .paymentMethod(transaction.getPaymentMethod())
                .transactionType(transaction.getTransactionType())
                .referenceCode(transaction.getReferenceCode())
                .status(transaction.getStatus())
                .amount(transaction.getAmount())
                .createdAt(transaction.getCreatedAt())
                .build());
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<TransactionSummaryResponse> getSummary() {
        TransactionSummaryResponse summary = transactionRepository.summarizeRevenue();
        return ResponseEntity.ok(summary);
    }
}
