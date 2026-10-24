package com.order_platform.e_commerce_core.client.inventory.dto;

import java.time.LocalDateTime;

public record InventoryResponse(
        String productId,
        Integer quantityOnHand,
        Integer quantityReserved,
        Integer available
) {
    public static InventoryResponse dummyOf(String productId, Integer requiredQuantity) {
        return new InventoryResponse(
                productId,
                requiredQuantity,
                0,
                requiredQuantity
        );
    }

}
