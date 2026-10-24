package com.order_platform.e_commerce_core.cart;

import com.order_platform.e_commerce_core.cart.dto.CartItemRequestDto;
import com.order_platform.e_commerce_core.cart.dto.CartResponseDto;
import com.order_platform.e_commerce_core.cart.internal.CartMapper;
import com.order_platform.e_commerce_core.cart.internal.CartRepository;
import com.order_platform.e_commerce_core.cart.internal.model.Cart;
import com.order_platform.e_commerce_core.cart.internal.model.CartItem;
import com.order_platform.e_commerce_core.client.checkout.CheckoutClient;
import com.order_platform.e_commerce_core.client.inventory.InventoryClient;
import com.order_platform.e_commerce_core.client.inventory.dto.InventoryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;

// Soft inventory check on add-to-cart, including the fallback when inventory-service can't be reached
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    private static final Long USER_ID = 7L;
    private static final String PRODUCT_ID = "p-1";

    @Mock CartRepository cartRepository;
    @Mock InventoryClient inventoryClient;
    @Mock CheckoutClient checkoutClient;

    private CartService cartService;
    private Cart cart;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartRepository, new CartMapper(), inventoryClient, checkoutClient);
        cart = new Cart();
        cart.setCartId("cart-1");
        cart.setUserId(USER_ID);
        cart.setItems(new ArrayList<>());
        given(cartRepository.findByUserId(USER_ID)).willAnswer(inv -> Optional.of(cart));
        // lenient: the client-error test fails before anything is saved
        lenient().when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private int quantityAfterAdding(int quantity) {
        CartResponseDto result = cartService.addItem(USER_ID, new CartItemRequestDto(PRODUCT_ID, quantity));
        cart.setItems(new ArrayList<>(result.items()));
        return result.items().stream()
                .filter(item -> item.getProductId().equals(PRODUCT_ID))
                .findFirst().orElseThrow()
                .getQuantity();
    }

    @Test
    void inventoryUnreachable_newItemIsCappedAtFallbackMax() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willThrow(new ResourceAccessException("Connection refused"));

        assertThat(quantityAfterAdding(12)).isEqualTo(CartService.FALLBACK_MAX_QUANTITY);
    }

    @Test
    void inventoryUnreachable_existingItemGrowsUpToFallbackMaxThenStops() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willThrow(new ResourceAccessException("Connection refused"));
        cart.setItems(new ArrayList<>(List.of(new CartItem(PRODUCT_ID, 9))));

        assertThat(quantityAfterAdding(1)).isEqualTo(10);
        assertThat(quantityAfterAdding(1)).isEqualTo(10);
    }

    @Test
    void inventoryServerError_alsoFallsBack() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willThrow(new HttpServerErrorException(HttpStatus.SERVICE_UNAVAILABLE));

        assertThat(quantityAfterAdding(3)).isEqualTo(3);
        assertThat(quantityAfterAdding(20)).isEqualTo(CartService.FALLBACK_MAX_QUANTITY);
    }

    @Test
    void inventoryReturnsNoBody_fallsBack() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willReturn(null);

        assertThat(quantityAfterAdding(15)).isEqualTo(CartService.FALLBACK_MAX_QUANTITY);
    }

    @Test
    void inventoryReachable_realStockStillLimitsQuantity() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willReturn(new InventoryResponse(PRODUCT_ID, 3, 0, 3));

        assertThat(quantityAfterAdding(5)).isEqualTo(3);
    }

    @Test
    void inventoryClientError_isNotTreatedAsUnreachable() {
        given(inventoryClient.getInventory(PRODUCT_ID)).willThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> quantityAfterAdding(1)).isInstanceOf(HttpClientErrorException.class);
    }
}
