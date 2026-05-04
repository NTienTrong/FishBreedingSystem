package com.fishbreeding.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.WishlistItem;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    @EntityGraph(attributePaths = "product")
    List<WishlistItem> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<WishlistItem> findByUser_IdAndProduct_Id(Long userId, Long productId);

    void deleteByUser_IdAndProduct_Id(Long userId, Long productId);
}
