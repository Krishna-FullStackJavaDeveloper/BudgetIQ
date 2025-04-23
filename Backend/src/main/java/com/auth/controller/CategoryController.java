package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.CategoryRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.CategoryResponse;
import com.auth.serviceImpl.CategoryService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.hateoas.PagedModel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;


@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
public class CategoryController {
    private final CategoryService categoryService;

    // Create Category API
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryRequest request,
                                                                        @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        CategoryResponse categoryResponse = categoryService.createCategory(request, userId);
        ApiResponse<CategoryResponse> response = new ApiResponse<>("Category created successfully.", categoryResponse, 200);
        return ResponseEntity.ok(response);
    }


    // List Categories API
    @GetMapping
    public ResponseEntity<ApiResponse<PagedModel<CategoryResponse>>> getAllCategories(Pageable pageable,
                                                                                      @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        Page<CategoryResponse> categories = categoryService.getAllCategories(pageable, userId);
        PagedModel<CategoryResponse> pagedModel = PagedModel.of(categories.getContent(),
                new PagedModel.PageMetadata(categories.getSize(), categories.getNumber(), categories.getTotalElements()));

        ApiResponse<PagedModel<CategoryResponse>> response = new ApiResponse<>("Categories fetched successfully.", pagedModel, 200);
        return ResponseEntity.ok(response);
    }

    // Update Category API
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request,
                                                                        @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        CategoryResponse categoryResponse = categoryService.updateCategory(id, request, userId);
        ApiResponse<CategoryResponse> response = new ApiResponse<>("Category updated successfully.", categoryResponse, 200);
        return ResponseEntity.ok(response);
    }

    // Delete Category API
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id,
                                                              @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        categoryService.softDeleteCategory(id, userId);
        ApiResponse<String> response = new ApiResponse<>("Category deleted successfully.", "Category deleted", 200);
        return ResponseEntity.ok(response);
    }

    // Get Category History API
    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryHistory(@PathVariable Long id) {
        CategoryResponse categoryResponse = categoryService.getCategoryHistory(id);
        ApiResponse<CategoryResponse> response = new ApiResponse<>("Category history fetched successfully.", categoryResponse, 200);
        return ResponseEntity.ok(response);
    }
}
