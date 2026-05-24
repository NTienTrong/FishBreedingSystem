package com.fishbreeding.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.VnpayTransaction;

@Repository
public interface VnpayTransactionRepository extends JpaRepository<VnpayTransaction, Long> {
    @EntityGraph(attributePaths = {"order"})
    List<VnpayTransaction> findAllByOrderByCreatedAtDescIdDesc();

    Optional<VnpayTransaction> findByVnpTxnRef(String vnpTxnRef);

    Optional<VnpayTransaction> findTopByOrder_IdOrderByCreatedAtDescIdDesc(Long orderId);
}