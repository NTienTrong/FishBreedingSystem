package com.fishbreeding.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct_IdOrderBySortOrderAscIdAsc(Long productId);
    List<ProductImage> findByProduct_IdInOrderBySortOrderAscIdAsc(java.util.List<Long> productIds);

    void deleteByProduct_Id(Long productId);
}
