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

//    @Query("SELECT new com.auth.payload.response.MonthlyProgressResponse(" +
//            "FUNCTION('DATE_FORMAT', t.date, '%b %Y'), SUM(t.amount)) " +
//            "FROM GoalTransaction t " +
//            "WHERE t.goal = ?1 " +
//            "GROUP BY FUNCTION('DATE_FORMAT', t.date, '%b %Y') " +
//            "ORDER BY MIN(t.date)")
//    List<MonthlyProgressResponse> getMonthlyProgress(@Param("goal") SavingGoal goal);
//
    @Query(value = "SELECT DATE_FORMAT(date, '%b %Y') AS month, SUM(amount) AS totalSaved " +
            "FROM goal_transaction WHERE goal_id = :goalId " +
            "GROUP BY month ORDER BY MIN(date)",
            nativeQuery = true)
    List<Object[]> getMonthlyProgress(@Param("goalId") Long goalId);

}
