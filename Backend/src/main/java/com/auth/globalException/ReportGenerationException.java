package com.auth.globalException;

public class ReportGenerationException extends RuntimeException{
    public ReportGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
