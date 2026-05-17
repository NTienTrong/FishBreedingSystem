package com.fishbreeding.backend.service;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fishbreeding.backend.entity.Order;
import com.fishbreeding.backend.entity.PaymentMethod;
import com.fishbreeding.backend.entity.Transaction;
import com.fishbreeding.backend.entity.TransactionStatus;
import com.fishbreeding.backend.entity.TransactionType;
import com.fishbreeding.backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final com.fishbreeding.backend.service.SseService sseService;

    @Transactional
    public Transaction createCodTransaction(Order order, String ghnOrderCode) {
        if (order == null) {
            return null;
        }

        return transactionRepository.findByOrder_IdAndPaymentMethod(order.getId(), PaymentMethod.COD)
            .orElseGet(() -> transactionRepository.save(Transaction.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(PaymentMethod.COD)
                .transactionType(TransactionType.CASH)
                .referenceCode(StringUtils.hasText(ghnOrderCode) ? ghnOrderCode.trim() : order.getOrderCode())
                .status(TransactionStatus.SUCCESS)
                .build()));
    }

    @Transactional
    public Transaction createVnpayTransaction(Order order, String referenceCode, BigDecimal amount, boolean success) {
        if (order == null) {
            return null;
        }

        Transaction existing = transactionRepository.findByOrder_IdAndPaymentMethod(order.getId(), PaymentMethod.VNPAY)
            .orElse(null);
        Transaction target = existing != null ? existing : Transaction.builder().order(order).build();

        target.setAmount(amount != null ? amount : order.getTotalAmount());
        target.setPaymentMethod(PaymentMethod.VNPAY);
        target.setTransactionType(TransactionType.ONLINE);
        target.setReferenceCode(referenceCode);
        target.setStatus(success ? TransactionStatus.SUCCESS : TransactionStatus.FAILED);

        Transaction saved = transactionRepository.save(target);

        // Emit admin-level realtime event
        try {
            var payload = Map.of(
                "id", saved.getId(),
                "orderCode", saved.getOrder() != null ? saved.getOrder().getOrderCode() : null,
                "amount", saved.getAmount(),
                "paymentMethod", saved.getPaymentMethod(),
                "status", saved.getStatus(),
                "createdAt", saved.getCreatedAt()
            );
            sseService.emit("admin", "transaction", payload);

            // also emit per-order topic
            if (saved.getOrder() != null && saved.getOrder().getOrderCode() != null) {
                sseService.emit("order:" + saved.getOrder().getOrderCode(), "transaction", payload);
            }
        } catch (Exception ex) {
            // don't fail transaction because SSE failed
        }

        return saved;
    }
}
