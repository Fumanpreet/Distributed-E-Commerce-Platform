package com.order_platform.e_commerce_core.order.internal;

import com.order_platform.e_commerce_core.client.checkout.CheckoutClient;
import com.order_platform.e_commerce_core.client.checkout.dto.OrderStatusResponse;
import com.order_platform.e_commerce_core.exception.ResourceNotFoundException;
import com.order_platform.e_commerce_core.identity.internal.UserPrinciple;
import com.order_platform.e_commerce_core.order.dto.OrderStatusDto;
import com.order_platform.e_commerce_core.order.dto.OrderSummaryDto;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final CheckoutClient checkoutClient;

    public OrderController(CheckoutClient checkoutClient) {
        this.checkoutClient = checkoutClient;
    }

    // Order history for the logged-in user, newest first
    @GetMapping
    public ResponseEntity<List<OrderSummaryDto>> getOrders(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal) {

        List<OrderSummaryDto> orders = checkoutClient.getOrdersForUser(principal.getUserId())
                .stream()
                .map(OrderSummaryDto::fromResponse)
                .toList();

        return ResponseEntity.ok(orders);
    }

    // Polled by the frontend after checkout until the order reaches a final status
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderStatusDto> getOrder(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal,
            @PathVariable UUID orderId) {

        OrderStatusResponse order = checkoutClient.getOrder(orderId);

        // Don't reveal other users' orders
        if (!principal.getUserId().equals(order.userId())) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }

        return ResponseEntity.ok(OrderStatusDto.fromResponse(order));
    }
}
