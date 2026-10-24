package com.order_platform.e_commerce_core.cart.internal;

import com.order_platform.e_commerce_core.cart.CartService;
import com.order_platform.e_commerce_core.cart.dto.CartItemRequestDto;
import com.order_platform.e_commerce_core.cart.dto.CartResponseDto;
import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutResponse;
import com.order_platform.e_commerce_core.identity.internal.UserPrinciple;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
// Auth is enforced by the security filter chain (anyRequest().authenticated()), so principal is never null here
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // TODO
    // Have to implement if no USER is LOGGED IN then when retrieve the cart from BROWSER'S CACHE

    // Make JWT based retrieval cart from MONGODB database

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal) { // retrieve userId from security session
        Long userId = principal.getUserId();

        // Pass it down to the service layer to talk to MongoDB
        CartResponseDto cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/item/add")
    public ResponseEntity<CartResponseDto> addItem(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal,
            @RequestBody CartItemRequestDto request
    ) {
        Long userId = principal.getUserId();
        CartResponseDto cart = cartService.addItem(userId, request);

        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/item/delete")
    public ResponseEntity<CartResponseDto> deleteItem(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal,
            @RequestBody CartItemRequestDto request
    ) {
        Long userId = principal.getUserId();
        CartResponseDto cart = cartService.deleteItem(userId, request);

        return ResponseEntity.ok(cart);
    }


    //  Endpoint related to CHECKOUT SERVICE

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal) {

        Long userId = principal.getUserId();
        CheckoutResponse response = cartService.checkout(userId);

        return ResponseEntity.ok(response);
    }
}