package com.order_platform.e_commerce_core.client.checkout.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CheckoutItemRequest(

        @NotBlank
        String productId,

        @Min(1)
        Integer quantity

) {
}