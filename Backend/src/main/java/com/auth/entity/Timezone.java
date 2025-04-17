package com.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timezone")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Timezone {

    @Id
    @Column(name = "timezone", length = 125)
    private String timezone; // PK — like 'Asia/Kolkata'

    @Column(name = "country_code", length = 3, nullable = false)
    private String countryCode;

    @ManyToOne
    @JoinColumn(name = "country_code", referencedColumnName = "iso", insertable = false, updatable = false)
    private Country country;

}
