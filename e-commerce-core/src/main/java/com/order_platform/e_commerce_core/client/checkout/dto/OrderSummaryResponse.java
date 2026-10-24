package com.order_platform.e_commerce_core.client.checkout.dto;

import java.time.Instant;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID orderId,
        String status,
        int itemCount,
        Instant createdAt,
        Instant updatedAt
) {
}
