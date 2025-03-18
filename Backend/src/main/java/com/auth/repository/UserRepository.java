package com.auth.repository;

import com.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_ADMIN'")
    List<User> findAdmins();

    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.family.id = ?1 AND r.id = 2")
    Optional<User> findModeratorByFamilyId(@Param("familyId") Long familyId);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    User getUserByIdWithRoles(Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.family f")
    List<User> findAllUsers();

    @Query("SELECT u FROM User u WHERE u.family.id = :familyId")
    List<User> findAllByFamilyId(Long familyId);


    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles LEFT JOIN FETCH u.family WHERE u.id = :id")
    Optional<User> findByIdWithRolesAndFamily(@Param("id") Long id);


}
