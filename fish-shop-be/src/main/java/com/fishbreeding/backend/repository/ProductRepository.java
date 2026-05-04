package com.fishbreeding.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    @EntityGraph(attributePaths = "categories")
    java.util.Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = "categories")
    java.util.List<Product> findAllByOrderByIdAsc();
}
