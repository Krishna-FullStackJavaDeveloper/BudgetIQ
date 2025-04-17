package com.auth.globalUtils;

import com.auth.serviceImpl.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil() {
        throw new UnsupportedOperationException("Cannot instantiate utility class");
    }

    private static UserDetailsImpl getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    public static Long getCurrentLoggedInUserId() {
        return getPrincipal().getId();
    }

    public static String getCurrentLoggedInUsername() {
        return getPrincipal().getUsername();
    }

    public static String getCurrentLoggedInEmail() {
        return getPrincipal().getEmail();
    }

}
