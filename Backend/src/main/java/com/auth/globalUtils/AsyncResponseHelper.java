package com.auth.globalUtils;

import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Slf4j
public class AsyncResponseHelper {

    // For normal methods returning a CompletableFuture<T>
    public static <T> CompletableFuture<ResponseEntity<ApiResponse<MessageResponse>>> wrap(Callable<T> callable, String successMessage, String errorMessage) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                T result = callable.call();
                ApiResponse<MessageResponse> successResponse = new ApiResponse<>(successMessage, new MessageResponse(result.toString()), HttpStatus.OK.value());
                return ResponseEntity.ok(successResponse);
            } catch (Exception ex) {
                log.error(errorMessage, ex);
                ApiResponse<MessageResponse> errorResponse = new ApiResponse<>(errorMessage + ": " + ex.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR.value());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        });
    }

    // For async methods that already return a CompletableFuture<T>
    public static <T> CompletableFuture<ResponseEntity<ApiResponse<T>>> wrapAsync(
            Supplier<CompletableFuture<T>> supplier,
            String successMessage,
            String errorMessage) {

        return supplier.get()
                .thenApply(payload -> ResponseEntity.ok(
                        new ApiResponse<>(successMessage, payload, HttpStatus.OK.value())))
                .exceptionally(ex -> {
                    ex.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new ApiResponse<>(errorMessage + ": " + ex.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR.value()));
                });
    }

    // For methods returning CompletableFuture<ApiResponse<T>> with custom payload
    public static <T> CompletableFuture<ResponseEntity<ApiResponse<T>>> wrapGeneric(
            Callable<T> callable, String successMessage, String errorMessage) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                T result = callable.call();
                ApiResponse<T> successResponse = new ApiResponse<>(
                        successMessage,
                        result,
                        HttpStatus.OK.value()
                );
                return ResponseEntity.ok(successResponse);
            } catch (Exception ex) {
                log.error(errorMessage, ex);
                ApiResponse<T> errorResponse = new ApiResponse<>(
                        errorMessage + ": " + ex.getMessage(),
                        null,
                        HttpStatus.INTERNAL_SERVER_ERROR.value()
                );
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        });
    }
}
