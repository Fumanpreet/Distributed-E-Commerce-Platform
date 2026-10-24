package com.order_platform.e_commerce_core.cart.dto;


import com.order_platform.e_commerce_core.cart.internal.model.CartItem;

public record CartItemRequestDto(
    String productId,
    int quantity
){
    public CartItem toEntity(){
        CartItem item = new CartItem();
        item.setProductId(this.productId);
        item.setQuantity(this.quantity);
        return item;
    };
}