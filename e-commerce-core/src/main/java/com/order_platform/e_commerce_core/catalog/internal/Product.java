package com.order_platform.e_commerce_core.catalog.internal;

import com.order_platform.e_commerce_core.catalog.dto.ProductRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "men")
public class Product {
    @Id
    private String id;

    @Indexed
    private String description;

    private int price;

    private int noOfReviews;

    private double realPrice;

    private String shipment;

    // Boolean to support null / absent values
    private Boolean isPurchasable;

    // Mapping Constructor for DTO to model object
    public Product(ProductRequestDto request){
        this.description = request.description();
        this.price = request.price();
        this.noOfReviews = request.noOfReviews();
        this.realPrice = request.realPrice();
        this.shipment = request.shipment();
    }

}
