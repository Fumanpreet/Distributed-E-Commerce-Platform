package com.order_platform.e_commerce_core.catalog.internal;

import com.order_platform.e_commerce_core.catalog.CatalogService;
import com.order_platform.e_commerce_core.catalog.dto.ProductRequestDto;
import com.order_platform.e_commerce_core.catalog.dto.ProductResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDto>> getProducts() {
        List<ProductResponseDto> products = catalogService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResponseDto> getProduct(@PathVariable String id) {
        ProductResponseDto product = catalogService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/product/search")
    public ResponseEntity<List<ProductResponseDto>>  searchProducts(@RequestParam String q) {
        List<ProductResponseDto> products = catalogService.searchProducts(q);
        return ResponseEntity.ok(products);
    }


    @PostMapping("/product/create")
    public Product createProduct(@RequestBody ProductRequestDto request) {

        return catalogService.createProduct(request);
    }
}
