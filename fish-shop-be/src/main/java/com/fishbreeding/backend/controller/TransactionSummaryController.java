package com.fishbreeding.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.TransactionSummaryResponse;
import com.fishbreeding.backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionSummaryController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<TransactionSummaryResponse> getSummary() {
        TransactionSummaryResponse summary = transactionRepository.summarizeRevenue();
        return ResponseEntity.ok(summary);
    }
}
