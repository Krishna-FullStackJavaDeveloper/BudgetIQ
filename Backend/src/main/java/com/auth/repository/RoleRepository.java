package com.auth.repository;

import com.auth.eNum.ERole;
import com.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
//    List<Role> findAllById(List<Long> roleIds); // Fetch roles by IDs

    @Query("SELECT r FROM Role r WHERE r.id IN :roleIds")
    List<Role> findAllById(@Param("roleIds") List<Long> roleIds);


}
