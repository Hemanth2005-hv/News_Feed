package com.newsfeed.exception;

// Thrown for expected business-rule failures (e.g. duplicate email, bad credentials)
public class ApiException extends RuntimeException {

    public ApiException(String message) {
        super(message);
    }
}
