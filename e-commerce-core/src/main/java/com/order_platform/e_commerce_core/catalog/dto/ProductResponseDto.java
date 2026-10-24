package com.order_platform.e_commerce_core.catalog.dto;

import com.order_platform.e_commerce_core.catalog.internal.Product;

public record ProductResponseDto(
        String id,
        String description,
        int noOfReviews,
        int price
) {

    public static ProductResponseDto fromEntity(Product product) {
        return new ProductResponseDto(
                product.getId(),
                product.getDescription(),
                product.getNoOfReviews(),
                product.getPrice()
        );
    }
}