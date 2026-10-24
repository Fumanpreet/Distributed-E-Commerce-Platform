package com.order_platform.e_commerce_core.cart.internal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carts")
public class Cart {

        @Id
        private String cartId;

        @Indexed(unique = true)
        private Long userId;

        private OrderStatus status;

        private List<CartItem> items = new ArrayList<>();

        private Instant createdAt;

        private Instant updatedAt;
}
