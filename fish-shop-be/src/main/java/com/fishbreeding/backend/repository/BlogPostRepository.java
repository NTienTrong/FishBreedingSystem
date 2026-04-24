package com.fishbreeding.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.BlogPost;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<BlogPost> findAllByOrderByCreatedAtDescIdDesc();
}
