package com.fishbreeding.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.VnpayTransaction;

@Repository
public interface VnpayTransactionRepository extends JpaRepository<VnpayTransaction, Long> {
    Optional<VnpayTransaction> findByVnpTxnRef(String vnpTxnRef);
}