package com.auth.repository;

import com.auth.entity.Income;
import com.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long>{
    Page<Income> findByUserAndDeletedFalse(User user, Pageable pageable);
}
