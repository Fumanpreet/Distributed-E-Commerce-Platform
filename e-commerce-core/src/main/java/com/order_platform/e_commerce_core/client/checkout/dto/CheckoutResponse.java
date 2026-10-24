package com.order_platform.e_commerce_core.client.checkout.dto;

import java.util.UUID;

public record CheckoutResponse(

        UUID orderId,
        String status
) {
}
