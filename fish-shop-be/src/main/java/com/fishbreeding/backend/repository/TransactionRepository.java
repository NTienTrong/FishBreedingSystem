package com.fishbreeding.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.dto.TransactionSummaryResponse;
import com.fishbreeding.backend.entity.PaymentMethod;
import com.fishbreeding.backend.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @EntityGraph(attributePaths = {"order"})
    List<Transaction> findAllByOrderByCreatedAtDescIdDesc();

    Optional<Transaction> findByOrder_IdAndPaymentMethod(Long orderId, PaymentMethod paymentMethod);

    @Query("""
        select new com.fishbreeding.backend.dto.TransactionSummaryResponse(
            coalesce(sum(case when t.status = com.fishbreeding.backend.entity.TransactionStatus.SUCCESS then t.amount else 0 end), 0),
            coalesce(sum(case when t.status = com.fishbreeding.backend.entity.TransactionStatus.SUCCESS and t.paymentMethod = com.fishbreeding.backend.entity.PaymentMethod.VNPAY then t.amount else 0 end), 0),
            coalesce(sum(case when t.status = com.fishbreeding.backend.entity.TransactionStatus.SUCCESS and t.paymentMethod = com.fishbreeding.backend.entity.PaymentMethod.COD then t.amount else 0 end), 0)
        )
        from Transaction t
    """)
    TransactionSummaryResponse summarizeRevenue();
}
