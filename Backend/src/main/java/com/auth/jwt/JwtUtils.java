package com.auth.jwt;

import com.auth.serviceImpl.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Date;

@Slf4j
@Component
public class JwtUtils {

    @Value("${security.jwt.secret-key}")
    private String jwtSecret;

    @Value("${security.jwt.access-token.expiration-time}")
    private int accessTokenExpirationMs;

    @Value("${security.jwt.refresh-token.extended-expiration-time}")
    private int refreshTokenExpirationMs;

    private Key cachedKey;

    //    Generates an access token for an authenticated user with id in payload.
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return generateToken(userDetails.getUsername(), userDetails.getId(), accessTokenExpirationMs);
    }

    // Generates a refresh token for an authenticated user with id in payload
    public String generateRefreshToken(Authentication authentication) {
        Instant nowUtc = ZonedDateTime.now(ZoneOffset.UTC).toInstant();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("id", userDetails.getId())  // Add user id in refresh token
                .setIssuedAt(Date.from(nowUtc))
                .setExpiration(Date.from(nowUtc.plusMillis(refreshTokenExpirationMs)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Generates a new access token from a username with id in payload
    public String generateJwtTokenFromUsername(String username, Long userId) {
        return generateToken(username, userId, accessTokenExpirationMs);
    }

    //    Extracts username from a JWT token.
    public String getUserNameFromJwtToken(String token) {
        return parseTokenClaims(token).getSubject();
    }
    // Extracts user id from JWT token.
    public Long getUserIdFromJwtToken(String token) {
        return (Long) parseTokenClaims(token).get("id");
    }

    // Validates a JWT token.
    public boolean validateJwtToken(String authToken) {
        try {
            parseTokenClaims(authToken);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // ============================= PRIVATE HELPER METHODS =============================

    // Generates a JWT token with a specified expiration time, adding user id to the payload
    private String generateToken(String username, Long userId, int expirationMs) {
        Instant nowUtc = ZonedDateTime.now(ZoneOffset.UTC).toInstant();
        return Jwts.builder()
                .setSubject(username)
                .claim("id", userId)  // Add user id in token payload
                .setIssuedAt(Date.from(nowUtc))
                .setExpiration(Date.from(nowUtc.plusMillis(expirationMs)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Returns the signing key, caching it to avoid redundant decoding.
    private Key getSigningKey() {
        if (cachedKey == null) {
            synchronized (this) { // Ensures thread safety
                if (cachedKey == null) {
                    cachedKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
                }
            }
        }
        return cachedKey;
    }


    // Parses and retrieves claims from a JWT token.
    private Claims parseTokenClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
