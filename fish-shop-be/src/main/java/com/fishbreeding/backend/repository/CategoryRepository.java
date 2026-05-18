package com.fishbreeding.backend.repository;

import com.fishbreeding.backend.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAll();

    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Modifying
    @Query(value = "delete from product_category_map where category_id = :categoryId", nativeQuery = true)
    void deleteProductCategoryMappings(@Param("categoryId") Long categoryId);
}
