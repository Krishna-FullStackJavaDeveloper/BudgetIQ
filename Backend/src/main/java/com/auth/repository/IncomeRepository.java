package com.auth.repository;

import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long>{
    @Query("SELECT e FROM Income e " +
            "WHERE e.user = :user " +
            "AND e.deleted = false " +
            "AND (:month IS NULL OR FUNCTION('MONTH', e.date) = :month) " +
            "AND (:year IS NULL OR FUNCTION('YEAR', e.date) = :year)")
    Page<Income> findByUserAndDateMonthYear(
            @Param("user") User user,
            @Param("month") Integer month,
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("SELECT e FROM Income e WHERE e.user.id = :userId " +
            "AND e.deleted = false " +
            "AND FUNCTION('MONTH', e.date) = :month " +
            "AND FUNCTION('YEAR', e.date) = :year")
    List<Income> findByUserIdAndMonthAndYear(@Param("userId") Long userId,
                                              @Param("month") Integer month,
                                              @Param("year") Integer year);

    @Query("SELECT MIN(i.date) FROM Income i WHERE i.user.id = :userId AND i.deleted = false")
    Optional<Instant> findMinDateByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :start AND :end AND i.deleted = false")
    Optional<BigDecimal> sumByUserAndDateRange(@Param("userId") Long userId, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Income i " +
            "WHERE i.user = :user AND i.source = :source AND i.date BETWEEN :start AND :end")
    boolean existsByUserAndSourceAndDateBetween(@Param("user") User user,
                                                @Param("source") String source,
                                                @Param("start") Instant start,
                                                @Param("end") Instant end);

    @Query("SELECT i FROM Income i WHERE i.user = :user AND i.date BETWEEN :start AND :end AND i.deleted = false ORDER BY i.date ASC")
    List<Income> findByUserAndDateBetweenAndDeletedFalse(@Param("user") User user,
                                                         @Param("start") Instant start,
                                                         @Param("end") Instant end);

}
