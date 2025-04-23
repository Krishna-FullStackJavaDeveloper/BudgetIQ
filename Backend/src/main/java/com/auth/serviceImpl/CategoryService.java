package com.auth.serviceImpl;
import com.auth.entity.Category;
import com.auth.entity.User;
import com.auth.payload.request.CategoryRequest;
import com.auth.payload.response.CategoryResponse;
import com.auth.repository.CategoryRepository;
import com.auth.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryResponse createCategory(CategoryRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<Category> existingCategory = categoryRepository.findByNameAndUserIdAndDeletedFalse(request.getName(), userId);
        if (existingCategory.isPresent()) {
            throw new IllegalArgumentException("Category name already exists for this user.");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setIconName(request.getIconName());
        category.setColor(request.getColor());
        category.setUser(user);
        category.setCreatedBy(userId);
        category.setUpdatedBy(userId);
        category.setCreatedAt(Instant.now());
        category.setUpdatedAt(Instant.now());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    public Page<CategoryResponse> getAllCategories(Pageable pageable, Long userId) {
        return categoryRepository.findByUserIdAndDeletedFalse(userId, pageable)
                .map(this::mapToResponse);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request, Long userId) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new SecurityException("You are not authorized to update this category.");
        }

        category.setName(request.getName());
        category.setIconName(request.getIconName());
        category.setColor(request.getColor());
        category.setUpdatedBy(userId);
        category.setUpdatedAt(Instant.now());

        return mapToResponse(categoryRepository.save(category));
    }

    public void softDeleteCategory(Long id, Long userId) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category not found"));
        if (!category.getUser().getId().equals(userId)) {
            throw new SecurityException("You are not authorized to delete this category.");
        }
        category.setDeleted(true);
        category.setUpdatedAt(Instant.now());
        categoryRepository.save(category);
    }

    public CategoryResponse getCategoryHistory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category not found"));
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setIconName(category.getIconName());
        response.setColor(category.getColor());
        response.setUserId(category.getUser().getId());
        response.setCreatedBy(category.getCreatedBy());
        response.setUpdatedBy(category.getUpdatedBy());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }

}
