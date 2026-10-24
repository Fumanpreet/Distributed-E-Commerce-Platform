package com.order_platform.e_commerce_core.catalog.internal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface CatalogRepository extends MongoRepository<Product, String> {

    Optional<Product> findById(String id);

    List<Product> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);

    List<Product> findByPriceBetween(double minPrice, double maxPrice);

    List<Product> findByOrderByNoOfReviewsDesc();

    // Search text INSIDE a specific price range
    List<Product> findByDescriptionContainingIgnoreCaseAndPriceBetween(
            String description, double minPrice, double maxPrice
    );

}
