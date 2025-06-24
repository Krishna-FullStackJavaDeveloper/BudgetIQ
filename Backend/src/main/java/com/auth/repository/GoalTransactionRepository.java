package com.auth.repository;

import com.auth.entity.GoalTransaction;
import com.auth.entity.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalTransactionRepository extends JpaRepository<GoalTransaction, Long> {
    List<GoalTransaction> findByGoal(SavingGoal goal);
}
