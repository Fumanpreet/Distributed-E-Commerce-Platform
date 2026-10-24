package com.order_platform.e_commerce_core.order.dto;

import com.order_platform.e_commerce_core.client.checkout.dto.OrderStatusResponse;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusDto(
        UUID orderId,
        String status,
        Instant updatedAt
) {
    public static OrderStatusDto fromResponse(OrderStatusResponse response) {
        return new OrderStatusDto(response.orderId(), response.status(), response.updatedAt());
    }
}
