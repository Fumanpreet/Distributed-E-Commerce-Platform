package com.order_platform.e_commerce_core.client.checkout.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CheckoutRequest(

        UUID checkoutRequestId,

        String cartId,

        Long userId,

        Instant cartUpdatedAt,

        List<CheckoutItemRequest> items
) {
}
