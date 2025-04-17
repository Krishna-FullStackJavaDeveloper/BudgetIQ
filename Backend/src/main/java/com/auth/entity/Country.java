package com.auth.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "country")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Country {

    @Id
    @Column(name = "iso", length = 3)
    private String iso; // PK — like 'IN'

    @Column(name = "country", length = 155, nullable = false)
    private String country;

    @Column(name = "capital", length = 155)
    private String capital;

    @Column(name = "currency_name", length = 155)
    private String currencyName;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;


}
