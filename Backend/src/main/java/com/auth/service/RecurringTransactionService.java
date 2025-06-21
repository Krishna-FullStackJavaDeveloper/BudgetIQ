package com.auth.service;

import com.auth.payload.request.RecurringTransactionRequest;
import com.auth.payload.response.RecurringTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RecurringTransactionService {

    RecurringTransactionResponse addRecurringTransaction(RecurringTransactionRequest request, Long userId);
    Page<RecurringTransactionResponse> getAllByUserPaged(Long userId, Pageable pageable);
    RecurringTransactionResponse getById(UUID id);
    void updateRecurring(UUID id, RecurringTransactionRequest request);
    void softDelete(UUID id);

    void updateEnabledForUser(Long userId, boolean enabled);

}
