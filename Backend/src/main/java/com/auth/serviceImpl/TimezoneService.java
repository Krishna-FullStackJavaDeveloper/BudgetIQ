package com.auth.serviceImpl;

import com.auth.payload.response.TimezoneCountryDTO;
import com.auth.repository.TimezoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimezoneService {

    private final TimezoneRepository timezoneRepository;

    public List<TimezoneCountryDTO> getAllTimezonesWithCountries() {
        return timezoneRepository.getAllTimezoneWithCountryInfo();
    }

    public TimezoneCountryDTO getTimezoneDetails(String timezone) {
        return timezoneRepository.getByTimezone(timezone)
                .orElseThrow(() -> new RuntimeException("Timezone not found: " + timezone));
    }

}
