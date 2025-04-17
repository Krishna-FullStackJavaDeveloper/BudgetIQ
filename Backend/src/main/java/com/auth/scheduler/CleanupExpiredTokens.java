package com.auth.scheduler;

import com.auth.entity.RefreshToken;
import com.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupExpiredTokens {

    private final RefreshTokenRepository refreshTokenRepository;
    private final ExecutorService executorService = Executors.newFixedThreadPool(4); // Thread pool for async tasks

    @Scheduled(cron = "0 0 * * * ?", zone = "UTC") // Runs every hour
    public void cleanupExpiredTokens() {
        try {
            log.info("Start Cleaning Expired Tokens");

            //Fetch expired tokens in refresh-token table.
            Instant currentTimeUtc = Instant.now();

            //using lazy-loading stream to process refresh token
            //Expired time compare to UTC
            List<RefreshToken> expiredTokens = refreshTokenRepository.findAll().stream()
                    .filter(refreshToken -> refreshToken.getExpiryDate().isBefore(currentTimeUtc))
                    .collect(Collectors.toList());

            List<RefreshToken> expiredTokenList = expiredTokens.stream().collect(Collectors.toList());
            if (!expiredTokenList.isEmpty()) {
                executorService.submit(() -> {
                    refreshTokenRepository.deleteAll(expiredTokenList);
                    log.info("Deleted {} expired Tokens", expiredTokenList.size());
                });
            } else {
                log.info("No Expired Token found for cleanup.");
            }
        } catch (Exception e) {
            log.error("Error occurred while cleaning expired Tokens", e);
        }
    }
}
