package com.auth.repository;

import com.auth.entity.GoalTransaction;
import com.auth.entity.SavingGoal;
import com.auth.payload.response.MonthlyProgressResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalTransactionRepository extends JpaRepository<GoalTransaction, Long> {
    List<GoalTransaction> findByGoal(SavingGoal goal);

    @Query(value = "SELECT DATE_FORMAT(date, '%b %Y') AS month, SUM(amount) AS totalSaved " +
            "FROM goal_transaction " +
            "WHERE goal_id = :goalId AND soft_deleted = false " +
            "GROUP BY month ORDER BY MIN(date)",
            nativeQuery = true)
    List<Object[]> getMonthlyProgress(@Param("goalId") Long goalId);

    @Query("SELECT SUM(g.amount) FROM GoalTransaction g WHERE g.goal.id = :goalId AND g.softDeleted = false")
    Double getTotalSavedAmount(@Param("goalId") Long goalId);

    List<GoalTransaction> findByGoalAndSoftDeletedFalse(SavingGoal goal);

    Optional<GoalTransaction> findByIdAndGoal_User_Id(Long id, Long userId);

}
