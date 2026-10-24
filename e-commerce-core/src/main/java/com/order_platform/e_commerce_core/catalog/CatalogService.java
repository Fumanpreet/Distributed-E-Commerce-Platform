package com.order_platform.e_commerce_core.catalog;

import com.order_platform.e_commerce_core.exception.ResourceNotFoundException;
import com.order_platform.e_commerce_core.catalog.dto.ProductRequestDto;
import com.order_platform.e_commerce_core.catalog.dto.ProductResponseDto;
import com.order_platform.e_commerce_core.catalog.internal.CatalogRepository;
import com.order_platform.e_commerce_core.catalog.internal.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    private final CatalogRepository catalogRepository;

    // same as @bean, just a constructor implementation
    public CatalogService(CatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    public List<ProductResponseDto> getAllProducts() {
        // pagination
        Pageable topTen = PageRequest.of(0, 10);
        List<Product> products = catalogRepository.findAll(topTen).getContent();

        return products
                .stream()
                .map(ProductResponseDto::fromEntity) // Convert Product -> DTO
                .toList();
    }

    public ProductResponseDto getProduct(String id) {
        Product product = catalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        return ProductResponseDto.fromEntity(product);
    }

    public List<ProductResponseDto> searchProducts(String query) {
        // hardcoded page and size for now
        Pageable topTen = PageRequest.of(0, 10);
        List<Product> products= catalogRepository.findByDescriptionContainingIgnoreCase(query, topTen);

        return products
                .stream()
                .map(ProductResponseDto::fromEntity)
                .toList();
    }

    public Product createProduct(ProductRequestDto request) {

        Product product = new Product(request);

        return catalogRepository.save(product);
    }

//        public List<Product> getProductsByCategory(String category) {
//
//        return catalogRepository.findByCategoryIgnoreCase(category);
//    }
//
}