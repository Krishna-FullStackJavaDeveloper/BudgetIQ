package com.auth.globalUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateFormatUtil {

    public static String formatDate(Instant instant, ZoneId zoneId) {
        if (instant == null) {
            return "N/A";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy, EEEE | h:mm a").withZone(zoneId);
        return formatter.format(instant);
    }

    // Optional: Overloaded method for legacy use with LocalDateTime
    public static String formatDate(LocalDateTime dateTime, ZoneId zoneId) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.atZone(ZoneId.systemDefault())
                .withZoneSameInstant(zoneId)
                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy, EEEE | h:mm a"));
    }

    public static String formatLocalDate(LocalDate localDate, ZoneId zoneId) {
        if (localDate == null) return "N/A";
        return localDate.atStartOfDay(zoneId)
                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy, EEEE"));
    }

}
