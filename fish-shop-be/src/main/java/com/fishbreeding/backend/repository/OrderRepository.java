package com.fishbreeding.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByUser_IdOrderByCreatedAtDescIdDesc(Long userId);

    Optional<Order> findByOrderCode(String orderCode);
}
