package com.order_platform.e_commerce_core.catalog.dto;

public record ProductRequestDto(
    String description,
    int price,
    int noOfReviews,
    double realPrice,
    String shipment
){

}
