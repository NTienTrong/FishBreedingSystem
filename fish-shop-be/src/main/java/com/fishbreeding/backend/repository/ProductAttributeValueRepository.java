package com.fishbreeding.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.ProductAttributeValue;
import com.fishbreeding.backend.entity.ProductAttributeValueId;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, ProductAttributeValueId> {
    @EntityGraph(attributePaths = "attribute")
    List<ProductAttributeValue> findByProduct_IdOrderByAttribute_IdAsc(Long productId);

    @EntityGraph(attributePaths = "attribute")
    List<ProductAttributeValue> findByProduct_IdInOrderByAttribute_IdAsc(java.util.List<Long> productIds);

    void deleteByProduct_Id(Long productId);

    void deleteByAttribute_Id(Long attributeId);
}
