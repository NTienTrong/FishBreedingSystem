package com.fishbreeding.backend.repository;

import java.util.Optional;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Query("""
                SELECT c FROM CartItem c
                JOIN FETCH c.product
                WHERE c.user.id = :userId
                ORDER BY c.createdAt DESC
            """)
    List<CartItem> findByUserIdWithProduct(@Param("userId") Long userId);

    Optional<CartItem> findByUser_IdAndProduct_Id(Long userId, Long productId);

    void deleteByUser_IdAndProduct_Id(Long userId, Long productId);

    void deleteByUser_Id(Long userId);
}
