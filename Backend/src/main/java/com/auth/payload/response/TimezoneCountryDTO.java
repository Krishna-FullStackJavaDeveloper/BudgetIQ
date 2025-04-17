package com.auth.payload.response;
import lombok.*;

@Getter
@Setter
public class TimezoneCountryDTO {
    private String timezone;
    private String iso;
    private String country;
    private String capital;
    private String currencyCode;
    private String currencyName;

    public TimezoneCountryDTO(String timezone, String iso, String country,
                              String capital, String currencyCode, String currencyName) {
        this.timezone = timezone;
        this.iso = iso;
        this.country = country;
        this.capital = capital;
        this.currencyCode = currencyCode;
        this.currencyName = currencyName;
    }
}
