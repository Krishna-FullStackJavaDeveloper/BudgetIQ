package com.auth.serviceImpl;

import com.auth.entity.GoalTransaction;
import com.auth.entity.SavingGoal;
import com.auth.globalException.UnauthorizedAccessException;
import com.auth.payload.request.GoalSearchFilter;
import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.request.SavingGoalRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.MonthlyProgressResponse;
import com.auth.payload.response.SavingGoalResponse;
import com.auth.repository.GoalTransactionRepository;
import com.auth.repository.SavingGoalRepository;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.auth.service.SavingGoalService;

import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.globalUtils.TimezoneUtil;
import com.auth.globalUtils.DateFormatUtil;

import java.util.List;
import java.time.Instant;
import java.time.ZoneId;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingGoalServiceImpl implements SavingGoalService {

    private final SavingGoalRepository goalRepo;
    private final GoalTransactionRepository txnRepo;
    private final UserRepository userRepo;

//    Goal Service
    @Override
    public SavingGoalResponse createGoal(SavingGoalRequest request, Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Instant now = Instant.now();

        SavingGoal goal = new SavingGoal();
        goal.setUser(user);
        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        goal.setPriority(request.getPriority());
        goal.setSourceCategory(request.getSourceCategory());
        goal.setCreatedAt(now);
        goal.setUpdatedAt(now);

        goal = goalRepo.save(goal);

        return mapToResponse(goal, user);
    }

    @Override
    public List<SavingGoalResponse> getAllGoals(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return goalRepo.findByUserAndSoftDeletedFalse(user).stream()
                .map(goal -> mapToResponse(goal, user))
                .collect(Collectors.toList());
    }

    @Override
    public SavingGoalResponse getGoalDetails(Long goalId, Long userId) {
        SavingGoal goal = goalRepo.findById(goalId)
                .filter(g -> !g.isSoftDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found or deleted"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to goal");
        }

        return mapToResponse(goal, goal.getUser());
    }

    @Override
    public Page<SavingGoalResponse> searchGoals(Long userId, GoalSearchFilter filter) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Sort sort = Sort.by(Sort.Direction.fromString(filter.getDirection()), filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<SavingGoal> page = goalRepo.searchByTitleAndUser(filter.getKeyword(), user, pageable);

        return page.map(goal -> mapToResponse(goal, user));
    }

    @Override
    public SavingGoalResponse updateGoal(Long goalId, Long userId, SavingGoalRequest request) {
        SavingGoal goal = goalRepo.findById(goalId)
                .filter(g -> !g.isSoftDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found or deleted"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to update");
        }

        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        goal.setPriority(request.getPriority());
        goal.setSourceCategory(request.getSourceCategory());
        goal.setUpdatedAt(Instant.now());

        goal = goalRepo.save(goal);

        return mapToResponse(goal, goal.getUser());
    }

    @Override
    public void softDelete(Long goalId, Long userId) {
        SavingGoal goal = goalRepo.findById(goalId)
                .filter(g -> !g.isSoftDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found or deleted"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        goal.setActive(false);
        goal.setUpdatedAt(Instant.now());
        goal.setSoftDeleted(true);  // now using soft delete flag
        goal.setUpdatedAt(Instant.now());

        goalRepo.save(goal);
    }

    @Override
    public List<MonthlyProgressResponse> getMonthlyProgress(Long goalId, Long userId) {
        SavingGoal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        // Pass the goal ID here, not the goal object
        List<Object[]> results = txnRepo.getMonthlyProgress(goal.getId());

        // Map Object[] to MonthlyProgressResponse DTO
        return results.stream()
                .map(row -> new MonthlyProgressResponse(
                        (String) row[0],               // month (String)
                        ((Number) row[1]).doubleValue() // totalSaved (double)
                ))
                .collect(Collectors.toList());
    }

//    Goal Transaction Service
    @Override
    public GoalTransactionResponse addTransaction(GoalTransactionRequest request, Long userId) {
        SavingGoal goal = goalRepo.findById(request.getGoalId())
                .orElseThrow(() -> new ResourceNotFoundException("Saving Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to goal");
        }

        Double totalSaved = txnRepo.getTotalSavedAmount(goal.getId());
        totalSaved = totalSaved == null ? 0.0 : totalSaved;

        double maxAllowedToAdd = goal.getTargetAmount() - totalSaved;

        if (request.getAmount() > maxAllowedToAdd) {
            throw new RuntimeException(
                    "Amount exceeds target. You can add maximum: " + maxAllowedToAdd);
        }

        Instant now = Instant.now();

        GoalTransaction txn = new GoalTransaction();
        txn.setGoal(goal);
        txn.setAmount(request.getAmount());
        txn.setSourceNote(request.getSourceNote());
        txn.setManuallyAdded(request.isManuallyAdded());
        txn.setAutoTransferred(request.isAutoTransferred());
        txn.setDate(request.getDate() != null ? request.getDate() : now);
        txn.setCreatedAt(now);
        txn.setUpdatedAt(now);

        txn = txnRepo.save(txn);
        // ✅ Recalculate goal status after adding transaction
        recalculateGoalStatus(goal);

        return mapToTxnResponse(txn, goal.getUser());
    }

    @Override
    public List<GoalTransactionResponse> getTransactionsByGoalId(Long goalId, Long userId) {
        SavingGoal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Unauthorized access to goal");
        }

        return txnRepo.findByGoalAndSoftDeletedFalse(goal).stream()
                .map(GoalTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public GoalTransactionResponse updateTransaction(Long transactionId, GoalTransactionRequest request, Long userId) {


        GoalTransaction transaction = txnRepo.findByIdAndGoal_User_Id(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        SavingGoal goal = transaction.getGoal();

        Double totalSaved = txnRepo.getTotalSavedAmount(goal.getId());
        totalSaved = totalSaved == null ? 0.0 : totalSaved;

        // Calculate total saved excluding current transaction amount
        double totalExcludingCurrent = totalSaved - transaction.getAmount();

        double maxAllowedToUpdate = goal.getTargetAmount() - totalExcludingCurrent;

        if (request.getAmount() > maxAllowedToUpdate) {
            throw new RuntimeException(
                    "Amount exceeds target. You can update maximum to: " + maxAllowedToUpdate);
        }


        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setSourceNote(request.getSourceNote());
        transaction.setManuallyAdded(request.isManuallyAdded());
        transaction.setAutoTransferred(request.isAutoTransferred());
        transaction.setUpdatedAt(Instant.now());

        txnRepo.save(transaction);

        // Recalculate goal status after update
        recalculateGoalStatus(goal);

        return GoalTransactionResponse.fromEntity(transaction);
    }

    @Override
    public void deleteTransaction(Long transactionId, Long userId) {
        GoalTransaction transaction = txnRepo.findByIdAndGoal_User_Id(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transaction.setSoftDeleted(true);
        transaction.setUpdatedAt(Instant.now());

        txnRepo.save(transaction);

        // ✅ Recalculate goal status after delete
        SavingGoal goal = transaction.getGoal();
        recalculateGoalStatus(goal);
    }

    private void recalculateGoalStatus(SavingGoal goal) {
        Double totalSaved = txnRepo.getTotalSavedAmount(goal.getId());
        totalSaved = totalSaved == null ? 0.0 : totalSaved;

        boolean achieved = totalSaved >= goal.getTargetAmount();

        goal.setAchieved(achieved);
        goal.setActive(!achieved); // active = false if achieved
        goal.setUpdatedAt(Instant.now());

        goalRepo.save(goal);
    }


    private SavingGoalResponse mapToResponse(SavingGoal goal, User user) {
        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        // Use new repository method that excludes softDeleted transactions
        List<GoalTransaction> transactions = txnRepo.findByGoalAndSoftDeletedFalse(goal);
//        List<GoalTransaction> transactions = txnRepo.findByGoal(goal);
        double totalSaved = transactions.stream().mapToDouble(GoalTransaction::getAmount).sum();
        double percent = (totalSaved / goal.getTargetAmount()) * 100.0;

        SavingGoalResponse res = new SavingGoalResponse();
        res.setId(goal.getId());
        res.setTitle(goal.getTitle());
        res.setTargetAmount(goal.getTargetAmount());
        res.setStartDate(DateFormatUtil.formatDateGoal(goal.getStartDate(), zoneId));
        res.setEndDate(DateFormatUtil.formatDateGoal(goal.getEndDate(), zoneId));
        res.setActive(goal.isActive());
        res.setAchieved(goal.isAchieved());
        res.setPriority(goal.getPriority());
        res.setSourceCategory(goal.getSourceCategory());
        res.setCreatedAt(DateFormatUtil.formatDateGoal(goal.getCreatedAt(), zoneId));
        res.setUpdatedAt(DateFormatUtil.formatDateGoal(goal.getUpdatedAt(), zoneId));
        res.setTotalSaved(totalSaved);
        res.setProgressPercent(Math.min(percent, 100.0));

        return res;
    }

    private GoalTransactionResponse mapToTxnResponse(GoalTransaction txn, User user) {
        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        GoalTransactionResponse res = new GoalTransactionResponse();
        res.setId(txn.getId());
        res.setAmount(txn.getAmount());
        res.setDate(DateFormatUtil.formatDateGoal(txn.getDate(), zoneId));
        res.setSourceNote(txn.getSourceNote());
        res.setManuallyAdded(txn.isManuallyAdded());
        res.setAutoTransferred(txn.isAutoTransferred());
        res.setCreatedAt(DateFormatUtil.formatDateGoal(txn.getCreatedAt(), zoneId));

        return res;
    }


}
