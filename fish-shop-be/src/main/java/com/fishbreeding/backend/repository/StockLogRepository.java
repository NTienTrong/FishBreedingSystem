package com.fishbreeding.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.StockLog;

@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    Page<StockLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
