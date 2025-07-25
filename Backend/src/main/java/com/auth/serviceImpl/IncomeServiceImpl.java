package com.auth.serviceImpl;
import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.payload.request.IncomeRequest;
import com.auth.payload.response.ExpenseResponse;
import com.auth.payload.response.IncomeResponse;
import com.auth.repository.IncomeRepository;
import com.auth.repository.UserRepository;
import com.auth.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService{
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;


    @Override
    public IncomeResponse createIncome(IncomeRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Income income = Income.builder()
                .source(request.getSource())
                .amount(request.getAmount())
                .date(request.getDate())
                .createdAt(Instant.now())
                .deleted(false)
                .user(user)
                .build();
        incomeRepository.save(income);
        return mapToResponse(income);
    }

    @Override
    public Page<IncomeResponse> getAllIncomes(Pageable pageable, Long userId, Integer month, Integer year) {
        User user = userRepository.findById(userId).orElseThrow();
        return incomeRepository.findByUserAndDateMonthYear(user,  month, year, pageable)
                .map(this::mapToResponse);
    }

    public List<IncomeResponse> getMonthlyIncomes(Long userId, Integer month, Integer year) {
        List<Income> incomes = incomeRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return incomes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Income> getIncomeBetween(Long userId, Instant start, Instant end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return incomeRepository.findByUserAndDateBetweenAndDeletedFalse(user, start, end);
    }

    @Override
    public IncomeResponse updateIncome(Long id, IncomeRequest request, Long userId) {
        Income income = incomeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        if (!income.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        income.setSource(request.getSource());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setUpdatedAt(Instant.now());
        return mapToResponse(incomeRepository.save(income));
    }

    @Override
    public void softDeleteIncome(Long id, Long userId) {
        Income income = incomeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        if (!income.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        income.setDeleted(true);
        income.setUpdatedAt(Instant.now());
        incomeRepository.save(income);
    }

    @Override
    public IncomeResponse getIncomeHistory(Long id) {
        Income income = incomeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        return mapToResponse(income);
    }
    private IncomeResponse mapToResponse(Income income) {
        return IncomeResponse.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .date(income.getDate())
                .createdAt(income.getCreatedAt())
                .updatedAt(income.getUpdatedAt())
                .build();
    }
}
