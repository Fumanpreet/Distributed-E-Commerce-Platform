package com.order_platform.e_commerce_core.client;

import com.order_platform.e_commerce_core.client.checkout.config.CheckoutServiceProperties;
import com.order_platform.e_commerce_core.client.inventory.config.InventoryServiceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({
        InventoryServiceProperties.class,
        CheckoutServiceProperties.class
})
public class HttpClientConfig {

    // Provide the Builder bean manually if missing
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    public RestClient inventoryRestClient(
            RestClient.Builder builder,
            InventoryServiceProperties properties) {

        return builder
                .baseUrl(properties.baseUrl())
                .build();
    }

    @Bean
    public RestClient checkoutRestClient(
            RestClient.Builder builder,
            CheckoutServiceProperties properties) {
        return builder
                .baseUrl(properties.baseUrl())
                .build();
    }
}