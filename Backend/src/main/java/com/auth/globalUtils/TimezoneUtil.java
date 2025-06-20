package com.auth.globalUtils;

import com.auth.entity.User;

import java.time.ZoneId;

public class TimezoneUtil {
    public static ZoneId getUserZone(User user) {
        return user != null && user.getTimezone() != null
                ? ZoneId.of(user.getTimezone().getTimezone())
                : ZoneId.of("UTC");
    }
}
