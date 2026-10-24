package com.order_platform.e_commerce_core.identity.internal.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.order_platform.e_commerce_core.identity.internal"
)
public class IdentityPersistenceConfig {
}
