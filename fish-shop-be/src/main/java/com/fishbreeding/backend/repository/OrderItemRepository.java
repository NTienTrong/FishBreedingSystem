package com.fishbreeding.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.OrderItem;
import com.fishbreeding.backend.entity.OrderItemId;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    @EntityGraph(attributePaths = "product")
    List<OrderItem> findByOrder_Id(Long orderId);
}
