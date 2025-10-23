package com.auth.config;

import com.auth.annotation.CurrentUserArgumentResolver;
import com.auth.jwt.AuthEntryPointJwt;
import com.auth.jwt.AuthTokenFilter;
import com.auth.jwt.JwtUtils;
import com.auth.serviceImpl.RefreshTokenService;
import com.auth.serviceImpl.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsService, refreshTokenService); // Pass the required parameters
    }


    @Bean
    public static PasswordEncoder passwordEncoder() { // Singleton instance
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder()); // Use the singleton password encoder
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF is disabled because this is a stateless REST API using JWT tokens.
                // Disabling CSRF is safe since we do not rely on session cookies.
                .csrf(csrf -> csrf.disable())

                // Exception handling for unauthorized access
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))

                // Stateless session management (JWT-based)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Endpoint authorization
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**", "/api/users/**").permitAll()
                                .requestMatchers(
                                        "/api/test/**",
                                        "/api/timezones/**",
                                        "/api/categories/**",
                                        "/api/expenses/**",
                                        "/api/incomes/**",
                                        "/api/summary/**",
                                        "/api/families/**",
                                        "/api/recurring/**",
                                        "/api/goals/**",
                                        "/api/report/**",
                                        "/api/files/**"
                                ).permitAll()
                                .anyRequest().authenticated()
                );

        // Set custom authentication provider
        http.authenticationProvider(authenticationProvider());

        // Add JWT auth filter before the default username/password filter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    }
