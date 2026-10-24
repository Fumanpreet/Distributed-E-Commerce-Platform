package com.order_platform.e_commerce_core.identity.dto;

// Current logged-in user, returned by /auth/login and /auth/me
public record UserResponseDto(
        Long id,
        String email,
        String name
) {
}
