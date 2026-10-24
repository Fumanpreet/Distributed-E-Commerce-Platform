package com.order_platform.e_commerce_core.client.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services.inventory")
public record InventoryServiceProperties(
        String baseUrl
) {
}