package com.fishbreeding.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.InventoryAdjustRequest;
import com.fishbreeding.backend.dto.InventoryExportRequest;
import com.fishbreeding.backend.dto.InventoryRestockRequest;
import com.fishbreeding.backend.dto.StockLogResponse;
import com.fishbreeding.backend.service.InventoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@Validated
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/restock")
    public ResponseEntity<StockLogResponse> restock(@Valid @RequestBody InventoryRestockRequest request) {
        StockLogResponse response = inventoryService.addStock(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/export")
    public ResponseEntity<StockLogResponse> exportStock(@Valid @RequestBody InventoryExportRequest request) {
        StockLogResponse response = inventoryService.deductStock(
                request.getProductId(),
                request.getQuantity(),
                request.getReason(),
                request.getRecipientName(),
                request.getPhone(),
                request.getAddress()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/export")
    public ResponseEntity<StockLogResponse> exportStockPut(@Valid @RequestBody InventoryExportRequest request) {
        StockLogResponse response = inventoryService.deductStock(
                request.getProductId(),
                request.getQuantity(),
                request.getReason(),
                request.getRecipientName(),
                request.getPhone(),
                request.getAddress()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/adjust")
    public ResponseEntity<StockLogResponse> adjust(@Valid @RequestBody InventoryAdjustRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<StockLogResponse>> logs(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(inventoryService.getRecentLogs(limit));
    }
}
