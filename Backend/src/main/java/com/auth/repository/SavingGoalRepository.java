package com.auth.repository;

import com.auth.entity.SavingGoal;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, Long> {
    List<SavingGoal> findByUser(User user);

    List<SavingGoal> findByUserAndActiveTrue(User user);

    @Query("SELECT g FROM SavingGoal g WHERE g.user = :user AND g.active = true AND " +
            "(LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR :keyword IS NULL)")
    Page<SavingGoal> searchByTitleAndUser(@Param("keyword") String keyword, @Param("user") User user, Pageable pageable);
}
