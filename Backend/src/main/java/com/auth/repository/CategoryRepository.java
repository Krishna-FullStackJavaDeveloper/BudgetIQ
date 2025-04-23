package com.auth.repository;

import com.auth.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Find all categories by user ID and not soft-deleted
    Page<Category> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    // Find a category by ID and not soft-deleted
    Optional<Category> findByIdAndDeletedFalse(Long id);

    // Optional: Check if a category with the same name exists for a user
//    boolean existsByNameAndUserIdAndDeletedFalse(String name, Long userId);

    Optional<Category> findByNameAndUserIdAndDeletedFalse(String name, Long userId);

}
