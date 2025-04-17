package com.auth.controller;

import com.auth.payload.request.TimezoneRequestDTO;
import com.auth.payload.response.TimezoneCountryDTO;
import com.auth.serviceImpl.TimezoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timezones")
@RequiredArgsConstructor
public class TimezoneController {

    private final TimezoneService timezoneService;

    @GetMapping("/with-country")
    public List<TimezoneCountryDTO> getAllWithCountry() {
        return timezoneService.getAllTimezonesWithCountries();
    }

    @PostMapping("/getDetails")
    public ResponseEntity<TimezoneCountryDTO> getTimezoneInfo(@RequestBody TimezoneRequestDTO request) {
        TimezoneCountryDTO result = timezoneService.getTimezoneDetails(request.getTimezone());
        return ResponseEntity.ok(result);
    }
}
