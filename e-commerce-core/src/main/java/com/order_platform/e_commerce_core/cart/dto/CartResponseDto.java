package com.order_platform.e_commerce_core.cart.dto;

import com.order_platform.e_commerce_core.cart.internal.model.Cart;
import com.order_platform.e_commerce_core.cart.internal.model.CartItem;

import java.time.Instant;
import java.util.List;

public record CartResponseDto(
        String cartId,
        List<CartItem> items,
        Instant createdAt,
        Instant updatedAt
) {
    public static CartResponseDto fromEntity(Cart cart) {
        return new CartResponseDto(
                cart.getCartId(),
                cart.getItems(),
                cart.getCreatedAt(),
                cart.getUpdatedAt()
        );
    }
}
