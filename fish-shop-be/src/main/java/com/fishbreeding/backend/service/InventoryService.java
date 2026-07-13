package com.fishbreeding.backend.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fishbreeding.backend.dto.InventoryAdjustRequest;
import com.fishbreeding.backend.dto.InventoryRestockRequest;
import com.fishbreeding.backend.dto.StockLogResponse;
import com.fishbreeding.backend.entity.Product;
import com.fishbreeding.backend.entity.StockChangeType;
import com.fishbreeding.backend.entity.StockLog;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.ProductRepository;
import com.fishbreeding.backend.repository.StockLogRepository;
import com.fishbreeding.backend.validator.ProductValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockLogRepository stockLogRepository;
    private final ProductValidator productValidator;

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById", "activeProducts"}, allEntries = true)
    public StockLogResponse addStock(InventoryRestockRequest request) {
        productValidator.validateId(request.getProductId());
        int quantity = request.getQuantity();
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng nhập phải lớn hơn 0");
        }

        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + request.getProductId()));

        int currentStock = safeStock(product);
        product.setStockQuantity(currentStock + quantity);
        if (request.getCostPrice() != null) {
            product.setCostPrice(request.getCostPrice());
        }
        productRepository.save(product);

        StockLog log = stockLogRepository.save(StockLog.builder()
                .product(product)
                .changeType(StockChangeType.IMPORT)
                .quantityChanged(quantity)
                .partnerName(request.getSupplierName())
                .partnerPhone(request.getPhone())
                .partnerAddress(request.getAddress())
                .reason(trimToNull(request.getReason()))
                .costPrice(request.getCostPrice())
                .build());

        return toResponse(log);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById", "activeProducts"}, allEntries = true)
    public StockLogResponse deductStock(Long productId, int quantity, String reason) {
        return deductStock(productId, quantity, reason, null, null, null);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById", "activeProducts"}, allEntries = true)
    public StockLogResponse deductStock(Long productId, int quantity, String reason, String partnerName, String partnerPhone, String partnerAddress) {
        productValidator.validateId(productId);
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng trừ phải lớn hơn 0");
        }

        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        int currentStock = safeStock(product);
        if (currentStock < quantity) {
            throw new BadRequestException("Số lượng tồn kho không đủ");
        }

        product.setStockQuantity(currentStock - quantity);
        productRepository.save(product);

        StockLog log = stockLogRepository.save(StockLog.builder()
                .product(product)
                .changeType(StockChangeType.EXPORT)
                .quantityChanged(-quantity)
                .partnerName(partnerName)
                .partnerPhone(partnerPhone)
                .partnerAddress(partnerAddress)
                .reason(trimToNull(reason))
                .build());

        return toResponse(log);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById", "activeProducts"}, allEntries = true)
    public StockLogResponse restock(Long productId, int quantity, String reason) {
        productValidator.validateId(productId);
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng hoàn kho phải lớn hơn 0");
        }

        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        int currentStock = safeStock(product);
        product.setStockQuantity(currentStock + quantity);
        productRepository.save(product);

        StockLog log = stockLogRepository.save(StockLog.builder()
                .product(product)
                .changeType(StockChangeType.RETURN)
                .quantityChanged(quantity)
                .reason(trimToNull(reason))
                .build());

        return toResponse(log);
    }

    @Transactional
    @CacheEvict(cacheNames = {"products", "productById", "activeProducts"}, allEntries = true)
    public StockLogResponse adjustStock(InventoryAdjustRequest request) {
        productValidator.validateId(request.getProductId());

        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + request.getProductId()));

        int currentStock = safeStock(product);
        int newQuantity = request.getNewQuantity();
        if (newQuantity < 0) {
            throw new BadRequestException("Số lượng mới không hợp lệ");
        }

        int delta = newQuantity - currentStock;
        StockChangeType changeType = request.getChangeType() != null ? request.getChangeType() : StockChangeType.ADJUST;

        if (changeType == StockChangeType.RETURN && delta <= 0) {
            throw new BadRequestException("Hoàn hàng phải tăng số lượng tồn kho");
        }

        if (changeType == StockChangeType.EXPORT && delta >= 0) {
            throw new BadRequestException("Xuất kho phải giảm số lượng tồn kho");
        }

        if (changeType == StockChangeType.IMPORT && delta <= 0) {
            throw new BadRequestException("Nhập kho phải tăng số lượng tồn kho");
        }

        product.setStockQuantity(newQuantity);
        productRepository.save(product);

        StockLog log = stockLogRepository.save(StockLog.builder()
                .product(product)
                .changeType(changeType)
                .quantityChanged(delta)
                .reason(trimToNull(request.getReason()))
                .build());

        return toResponse(log);
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, int requiredQuantity) {
        productValidator.validateId(productId);
        if (requiredQuantity <= 0) {
            return true;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        return safeStock(product) >= requiredQuantity;
    }

    @Transactional(readOnly = true)
    public List<StockLogResponse> getRecentLogs(int limit) {
        int finalLimit = limit <= 0 ? 50 : Math.min(limit, 200);
        return stockLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, finalLimit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StockLogResponse toResponse(StockLog log) {
        return StockLogResponse.builder()
                .id(log.getId())
                .productId(log.getProduct().getId())
                .productName(log.getProduct().getName())
                .changeType(log.getChangeType())
                .quantityChanged(log.getQuantityChanged())
                .reason(log.getReason())
                .partnerName(log.getPartnerName())
                .partnerPhone(log.getPartnerPhone())
                .partnerAddress(log.getPartnerAddress())
                .costPrice(log.getCostPrice())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private int safeStock(Product product) {
        return product.getStockQuantity() == null ? 0 : product.getStockQuantity();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
