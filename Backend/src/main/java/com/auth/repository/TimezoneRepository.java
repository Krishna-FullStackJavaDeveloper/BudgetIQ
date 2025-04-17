package com.auth.repository;

import com.auth.entity.Timezone;
import com.auth.payload.response.TimezoneCountryDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimezoneRepository extends CrudRepository<Timezone, String>{

    @Query("SELECT new com.auth.payload.response.TimezoneCountryDTO(t.timezone, c.iso, c.country, c.capital, c.currencyCode, c.currencyName) " +
            "FROM Timezone t JOIN t.country c")
    List<TimezoneCountryDTO> getAllTimezoneWithCountryInfo();

    @Query("SELECT new com.auth.payload.response.TimezoneCountryDTO(" +
            "t.timezone, c.iso, c.country, c.capital, c.currencyCode, c.currencyName) " +
            "FROM Timezone t JOIN t.country c WHERE t.timezone = :timezone")
    Optional<TimezoneCountryDTO> getByTimezone(@Param("timezone") String timezone);

    Optional<Timezone> findByTimezone(String timezone);
}
