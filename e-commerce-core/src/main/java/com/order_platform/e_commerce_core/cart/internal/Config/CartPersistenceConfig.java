package com.order_platform.e_commerce_core.cart.internal.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
        basePackages = "com.order_platform.e_commerce_core.cart.internal"
)
public class CartPersistenceConfig {
}
