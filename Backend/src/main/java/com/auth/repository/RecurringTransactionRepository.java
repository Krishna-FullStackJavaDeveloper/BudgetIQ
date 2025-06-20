package com.auth.repository;

import com.auth.entity.RecurringTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    Page<RecurringTransaction> findAllByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    @Query("SELECT rt FROM RecurringTransaction rt JOIN FETCH rt.user WHERE rt.id = :id AND rt.deleted = false")
    Optional<RecurringTransaction> findByIdAndDeletedFalseWithUser(@Param("id") UUID id);

    List<RecurringTransaction> findAllByDeletedFalseAndStartDateLessThanEqual(LocalDate date);

    @Query("SELECT r FROM RecurringTransaction r JOIN FETCH r.user WHERE r.deleted = false AND r.startDate <= :date")
    List<RecurringTransaction> findAllActiveWithUser(@Param("date") LocalDate date);

    @Modifying
    @Query("UPDATE RecurringTransaction rt SET rt.enabled = :enabled WHERE rt.user.id = :userId")
    void updateEnabledForUser(@Param("userId") Long userId, @Param("enabled") boolean enabled);
}

