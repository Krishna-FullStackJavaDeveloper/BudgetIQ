package com.auth.repository;

import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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
}
