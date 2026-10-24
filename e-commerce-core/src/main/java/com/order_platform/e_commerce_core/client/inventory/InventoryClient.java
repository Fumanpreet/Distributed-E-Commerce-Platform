package com.order_platform.e_commerce_core.client.inventory;

import com.order_platform.e_commerce_core.client.inventory.dto.InventoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class InventoryClient {

    private final RestClient inventoryRestClient;

    public InventoryResponse getInventory(String productId) {

        return inventoryRestClient
                .get()
                .uri("/inventory/{productId}", productId)
                .retrieve()
                .body(InventoryResponse.class);
    }

//    public InventoryResponse reserve(
//            Long orderId,
//            String productId,
//            int quantity) {
//
//        ReserveInventoryRequest request =
//                new ReserveInventoryRequest(
//                        orderId,
//                        productId,
//                        quantity
//                );
//
//        return inventoryRestClient
//                .post()
//                .uri("/api/inventory/reservations")
//                .body(request)
//                .retrieve()
//                .body(InventoryResponse.class);
//    }
}