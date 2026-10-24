package com.order_platform.e_commerce_core.cart.internal;

import com.order_platform.e_commerce_core.cart.internal.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {

    Optional<Cart> findByUserId(Long userId);
}