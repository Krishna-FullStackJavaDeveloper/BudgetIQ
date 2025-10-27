package com.auth.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Target methods and parameters
@Target({ElementType.PARAMETER})
// Retention policy to keep this annotation at runtime
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}