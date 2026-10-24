package com.order_platform.e_commerce_core.catalog.internal.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(
        basePackages = "com.order_platform.e_commerce_core.catalog.internal"
)
public class CatalogPersistenceConfig {
}
