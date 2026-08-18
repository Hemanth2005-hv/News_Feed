package com.newsfeed.dto;

public record ApiError(
        int status,
        String message
) {
}
