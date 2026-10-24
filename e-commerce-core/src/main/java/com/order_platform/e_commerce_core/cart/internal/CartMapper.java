package com.order_platform.e_commerce_core.cart.internal;

import com.order_platform.e_commerce_core.cart.dto.CartResponseDto;
import com.order_platform.e_commerce_core.cart.internal.model.Cart;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;

@Component // Makes it a reusable Spring Bean
public class CartMapper {

    public Cart toEntity(Long userId, CartResponseDto dto) {
        if (dto == null) {
            return null;
        }

        Cart cart = new Cart();
        cart.setCartId(dto.cartId());
        cart.setUserId(userId);
        cart.setItems(dto.items() != null ? new ArrayList<>(dto.items()) : new ArrayList<>());
        cart.setUpdatedAt(Instant.now());

        return cart;
    }
}