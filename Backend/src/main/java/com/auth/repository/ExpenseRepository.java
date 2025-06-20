package com.auth.repository;

import com.auth.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT e FROM Expense e " +
            "WHERE e.user = :user " +
            "AND e.deleted = false " +
            "AND (:month IS NULL OR FUNCTION('MONTH', e.date) = :month) " +
            "AND (:year IS NULL OR FUNCTION('YEAR', e.date) = :year)")
    Page<Expense> findByUserAndDateMonthYear(
            @Param("user") User user,
            @Param("month") Integer month,
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
            "AND e.deleted = false " +
            "AND FUNCTION('MONTH', e.date) = :month " +
            "AND FUNCTION('YEAR', e.date) = :year")
    List<Expense> findByUserIdAndMonthAndYear(@Param("userId") Long userId,
                                              @Param("month") Integer month,
                                              @Param("year") Integer year);

    @Query("SELECT MIN(i.date) FROM Expense i WHERE i.user.id = :userId AND i.deleted = false")
    Optional<Instant> findMinDateByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(i.amount) FROM Expense i WHERE i.user.id = :userId AND i.date BETWEEN :start AND :end AND i.deleted = false")
    Optional<BigDecimal> sumByUserAndDateRange(@Param("userId") Long userId, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Expense e " +
            "WHERE e.user = :user AND e.category = :category AND e.date BETWEEN :start AND :end")
    boolean existsByUserAndCategoryAndDateBetween(@Param("user") User user,
                                                  @Param("category") String category,
                                                  @Param("start") Instant start,
                                                  @Param("end") Instant end);
}
