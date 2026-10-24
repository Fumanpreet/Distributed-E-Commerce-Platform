package com.order_platform.e_commerce_core.client.checkout.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services.checkout")
public record CheckoutServiceProperties(
        String baseUrl
) {}

