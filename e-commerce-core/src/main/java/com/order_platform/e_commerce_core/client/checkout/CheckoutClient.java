package com.order_platform.e_commerce_core.client.checkout;

import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutRequest;
import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutResponse;
import com.order_platform.e_commerce_core.client.checkout.dto.OrderStatusResponse;
import com.order_platform.e_commerce_core.client.checkout.dto.OrderSummaryResponse;
import com.order_platform.e_commerce_core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CheckoutClient {

    private final RestClient checkoutRestClient;

    public CheckoutResponse createOrder(CheckoutRequest request) {

        return checkoutRestClient
                .post()
                .uri("/internal/orders")
                .body(request)
                .retrieve()
                .body(CheckoutResponse.class);
    }

    public OrderStatusResponse getOrder(UUID orderId) {

        return checkoutRestClient
                .get()
                .uri("/internal/orders/{orderId}", orderId)
                .retrieve()
                .onStatus(status -> status.value() == HttpStatus.NOT_FOUND.value(), (request, response) -> {
                    throw new ResourceNotFoundException("Order not found: " + orderId);
                })
                .body(OrderStatusResponse.class);
    }

    public List<OrderSummaryResponse> getOrdersForUser(Long userId) {

        return checkoutRestClient
                .get()
                .uri(uri -> uri.path("/internal/orders").queryParam("userId", userId).build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<OrderSummaryResponse>>() {});
    }
}
