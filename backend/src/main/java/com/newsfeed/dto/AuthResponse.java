package com.newsfeed.dto;

public record AuthResponse(
        String token,
        String name,
        String email
) {
}
