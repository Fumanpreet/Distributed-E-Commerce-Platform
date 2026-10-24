package com.order_platform.e_commerce_core.identity.dto;

import com.order_platform.e_commerce_core.identity.internal.User;

public record RegisterResponseDto(
        Long id,
        String email,
        String name
) {
    public static RegisterResponseDto fromEntity(User user){
        return new RegisterResponseDto(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }
}
