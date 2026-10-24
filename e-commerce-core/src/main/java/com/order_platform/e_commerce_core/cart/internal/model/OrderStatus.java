package com.order_platform.e_commerce_core.cart.internal.model;

public enum OrderStatus {
    PENDING_INVENTORY,
    INVENTORY_RESERVED,
    INVENTORY_REJECTED,
    CONFIRMED,
    CANCELLED
}
