package com.auth.repository;

import com.auth.entity.SavingGoal;
import com.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal , Long> {
    List<SavingGoal> findByUser(User user);
    List<SavingGoal> findByUserAndActiveTrue(User user);
}
