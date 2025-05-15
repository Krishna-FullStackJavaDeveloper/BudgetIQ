package com.auth.repository;

import com.auth.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserAndDeletedFalse(User user, Pageable pageable);
}
