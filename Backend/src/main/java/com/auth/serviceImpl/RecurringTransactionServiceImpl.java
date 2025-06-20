package com.auth.serviceImpl;

import com.auth.entity.RecurringTransaction;
import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.globalUtils.DateFormatUtil;
import com.auth.globalUtils.TimezoneUtil;
import com.auth.payload.request.RecurringTransactionRequest;
import com.auth.payload.response.RecurringTransactionResponse;
import com.auth.repository.RecurringTransactionRepository;
import com.auth.repository.UserRepository;
import com.auth.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final UserRepository userRepository;

    @Override
    public RecurringTransactionResponse addRecurringTransaction(RecurringTransactionRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        RecurringTransaction recurring = getRecurringTransaction(request, user);

        RecurringTransaction saved = recurringTransactionRepository.save(recurring);

        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        return new RecurringTransactionResponse(

                saved.getUser().getId(),
                saved.getId(),
                saved.getTitle(),
                saved.getAmount(),
                saved.getType(),
                DateFormatUtil.formatLocalDate(saved.getStartDate(), zoneId),
                saved.getRepeatCycle(),
                saved.getRepeatDay(),
                saved.getCategory(),
                DateFormatUtil.formatLocalDate(saved.getEndDate(), zoneId),
                DateFormatUtil.formatDate(saved.getCreatedAt(), zoneId),
                DateFormatUtil.formatDate(saved.getUpdatedAt(), zoneId)
        );
    }

    @Override
    public Page<RecurringTransactionResponse> getAllByUserPaged(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        Page<RecurringTransaction> page = recurringTransactionRepository.findAllByUserIdAndDeletedFalse(userId, pageable);

        return page.map(txn -> new RecurringTransactionResponse(
                txn.getUser().getId(),
                txn.getId(),
                txn.getTitle(),
                txn.getAmount(),
                txn.getType(),
                DateFormatUtil.formatLocalDate(txn.getStartDate(), zoneId),
                txn.getRepeatCycle(),
                txn.getRepeatDay(),
                txn.getCategory(),
                DateFormatUtil.formatLocalDate(txn.getEndDate(), zoneId),
                DateFormatUtil.formatDate(txn.getCreatedAt(), zoneId),
                DateFormatUtil.formatDate(txn.getUpdatedAt(), zoneId)
        ));
    }


    @Override
    public RecurringTransactionResponse getById(UUID id) {
        RecurringTransaction txn = recurringTransactionRepository.findByIdAndDeletedFalseWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        ZoneId zoneId = txn.getUser().getTimezone() != null
                ? ZoneId.of(txn.getUser().getTimezone().getTimezone())
                : ZoneId.of("UTC");

        return new RecurringTransactionResponse(
                txn.getUser().getId(),
                txn.getId(),
                txn.getTitle(),
                txn.getAmount(),
                txn.getType(),
                DateFormatUtil.formatLocalDate(txn.getStartDate(), zoneId),
                txn.getRepeatCycle(),
                txn.getRepeatDay(),
                txn.getCategory(),
                DateFormatUtil.formatLocalDate(txn.getEndDate(), zoneId),
                DateFormatUtil.formatDate(txn.getCreatedAt(), zoneId),
                DateFormatUtil.formatDate(txn.getUpdatedAt(), zoneId)
        );
    }

    @Override
    public void updateRecurring(UUID id, RecurringTransactionRequest request) {
        RecurringTransaction txn = recurringTransactionRepository.findByIdAndDeletedFalseWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        txn.setTitle(request.getTitle());
        txn.setAmount(request.getAmount());
        txn.setType(request.getType());
        txn.setStartDate(request.getStartDate());
        txn.setRepeatCycle(request.getRepeatCycle());
        txn.setRepeatDay(request.getRepeatDay());
        txn.setCategory(request.getCategory());
        txn.setEndDate(request.getEndDate());

        recurringTransactionRepository.save(txn);
    }

    @Override
    public void softDelete(UUID id) {
        RecurringTransaction txn = recurringTransactionRepository.findByIdAndDeletedFalseWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        txn.setDeleted(true);
        recurringTransactionRepository.save(txn);
    }


    private RecurringTransaction getRecurringTransaction(RecurringTransactionRequest request, User user) {
        RecurringTransaction recurring = new RecurringTransaction();
        recurring.setUser(user);
        recurring.setTitle(request.getTitle());
        recurring.setAmount(request.getAmount());
        recurring.setType(request.getType());
        recurring.setStartDate(request.getStartDate());
        recurring.setRepeatCycle(request.getRepeatCycle());
        recurring.setRepeatDay(request.getRepeatDay());
        recurring.setCategory(request.getCategory());
        recurring.setEndDate(request.getEndDate());
        return recurring;
    }
}
