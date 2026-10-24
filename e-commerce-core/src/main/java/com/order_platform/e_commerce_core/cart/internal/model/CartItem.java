package com.order_platform.e_commerce_core.cart.internal.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @NotBlank
    private String productId;
    private int quantity;
}
