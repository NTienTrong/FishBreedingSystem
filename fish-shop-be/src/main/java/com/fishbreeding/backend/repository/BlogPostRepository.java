package com.fishbreeding.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishbreeding.backend.entity.BlogPost;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @EntityGraph(attributePaths = "author")
    java.util.Optional<BlogPost> findById(Long id);

    @EntityGraph(attributePaths = "author")
    List<BlogPost> findAllByOrderByCreatedAtDescIdDesc();

    @EntityGraph(attributePaths = "author")
    List<BlogPost> findAllByIsPublishedTrueOrderByPublishedAtDescCreatedAtDescIdDesc();
}
