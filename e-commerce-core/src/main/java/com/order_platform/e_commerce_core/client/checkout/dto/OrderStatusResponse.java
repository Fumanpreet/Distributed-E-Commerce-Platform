package com.order_platform.e_commerce_core.client.checkout.dto;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusResponse(
        UUID orderId,
        Long userId,
        String status,
        Instant updatedAt
) {
}
