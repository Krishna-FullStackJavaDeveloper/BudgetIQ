package com.auth.repository;

import com.auth.entity.Family;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {

    // Find a family by family ID
    Optional<Family> findById(Long id);

    Optional<Family> findByFamilyName(String familyName);
    boolean existsByFamilyName(String familyName);

    Optional<Family> findByUsers_Id(Long userId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.family.id = ?1 AND u.accountStatus = com.auth.eNum.AccountStatus.ACTIVE")
    long countActiveUsersByFamilyId(@Param("familyId") Long familyId);

}
