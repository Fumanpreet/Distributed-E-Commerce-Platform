package com.order_platform.e_commerce_core.order.dto;

import com.order_platform.e_commerce_core.client.checkout.dto.OrderSummaryResponse;

import java.time.Instant;
import java.util.UUID;

public record OrderSummaryDto(
        UUID orderId,
        String status,
        int itemCount,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderSummaryDto fromResponse(OrderSummaryResponse response) {
        return new OrderSummaryDto(response.orderId(), response.status(), response.itemCount(),
                response.createdAt(), response.updatedAt());
    }
}
