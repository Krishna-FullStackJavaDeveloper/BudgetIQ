package com.auth.serviceImpl;

import com.auth.entity.GoalTransaction;
import com.auth.entity.SavingGoal;
import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.request.SavingGoalRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.SavingGoalResponse;
import com.auth.repository.GoalTransactionRepository;
import com.auth.repository.SavingGoalRepository;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SavingGoalServiceImpl implements SavingGoalService{

    private final SavingGoalRepository goalRepo;
    private final GoalTransactionRepository txnRepo;
    private final UserRepository userRepo;

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
    public GoalTransactionResponse addTransaction(GoalTransactionRequest request, Long userId) {
        SavingGoal goal = goalRepo.findById(request.getGoalId())
                .orElseThrow(() -> new ResourceNotFoundException("Saving Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to goal");
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

        return mapToTxnResponse(txn, goal.getUser());
    }

    @Override
    public List<SavingGoalResponse> getAllGoals(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return goalRepo.findByUser(user).stream()
                .map(goal -> mapToResponse(goal, user))
                .collect(Collectors.toList());
    }

    @Override
    public SavingGoalResponse getGoalDetails(Long goalId, Long userId) {
        SavingGoal goal = goalRepo.findById(goalId).orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to goal");
        }

        return mapToResponse(goal, goal.getUser());
    }

    private SavingGoalResponse mapToResponse(SavingGoal goal, User user) {
        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        List<GoalTransaction> transactions = txnRepo.findByGoal(goal);
        double totalSaved = transactions.stream().mapToDouble(GoalTransaction::getAmount).sum();
        double percent = (totalSaved / goal.getTargetAmount()) * 100.0;

        SavingGoalResponse res = new SavingGoalResponse();
        res.setId(goal.getId());
        res.setTitle(goal.getTitle());
        res.setTargetAmount(goal.getTargetAmount());
        res.setStartDate(DateFormatUtil.formatDate(goal.getStartDate(), zoneId));
        res.setEndDate(DateFormatUtil.formatDate(goal.getEndDate(), zoneId));
        res.setActive(goal.isActive());
        res.setAchieved(goal.isAchieved());
        res.setPriority(goal.getPriority());
        res.setSourceCategory(goal.getSourceCategory());
        res.setCreatedAt(DateFormatUtil.formatDate(goal.getCreatedAt(), zoneId));
        res.setUpdatedAt(DateFormatUtil.formatDate(goal.getUpdatedAt(), zoneId));
        res.setTotalSaved(totalSaved);
        res.setProgressPercent(Math.min(percent, 100.0));

        return res;
    }

    private GoalTransactionResponse mapToTxnResponse(GoalTransaction txn, User user) {
        ZoneId zoneId = TimezoneUtil.getUserZone(user);

        GoalTransactionResponse res = new GoalTransactionResponse();
        res.setId(txn.getId());
        res.setAmount(txn.getAmount());
        res.setDate(DateFormatUtil.formatDate(txn.getDate(), zoneId));
        res.setSourceNote(txn.getSourceNote());
        res.setManuallyAdded(txn.isManuallyAdded());
        res.setAutoTransferred(txn.isAutoTransferred());
        res.setCreatedAt(DateFormatUtil.formatDate(txn.getCreatedAt(), zoneId));

        return res;
    }
}
