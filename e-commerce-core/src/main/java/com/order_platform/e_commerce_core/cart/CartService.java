package com.order_platform.e_commerce_core.cart;

import com.order_platform.e_commerce_core.cart.dto.CartItemRequestDto;
import com.order_platform.e_commerce_core.cart.dto.CartResponseDto;
import com.order_platform.e_commerce_core.cart.internal.CartMapper;
import com.order_platform.e_commerce_core.cart.internal.CartRepository;
import com.order_platform.e_commerce_core.cart.internal.model.Cart;
import com.order_platform.e_commerce_core.cart.internal.model.CartItem;
import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutItemRequest;
import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutRequest;
import com.order_platform.e_commerce_core.client.checkout.dto.CheckoutResponse;
import com.order_platform.e_commerce_core.exception.ResourceNotFoundException;
import com.order_platform.e_commerce_core.client.inventory.InventoryClient;
import com.order_platform.e_commerce_core.client.checkout.CheckoutClient;
import com.order_platform.e_commerce_core.client.inventory.dto.InventoryResponse;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    // to talk to microservice called INVENTORY
    private final InventoryClient inventoryClient;
    // to talk to microservice called CHECKOUT
    private final CheckoutClient checkoutClient;



    public CartService(CartRepository cartRepository,
                       CartMapper cartMapper,
                       InventoryClient inventoryClient, CheckoutClient checkoutClient){
        this.cartRepository = cartRepository;
        this.cartMapper = cartMapper;
        this.inventoryClient = inventoryClient;
        this.checkoutClient = checkoutClient;
    }

    // If there is nothing in cart, do not create it
    public CartResponseDto getCart(Long userId) {
        // Query MongoDB using the database User ID
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(Cart::new);

        return CartResponseDto.fromEntity(cart);
    }

    public CartResponseDto createCart(Long userId) {
        // Query MongoDB using the database User ID
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // create empty MongoDB document if none exists
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    // Saves directly into MongoDB
                    return cartRepository.save(newCart);
                });

        return CartResponseDto.fromEntity(cart);
    }

    // TODO
    // If no user is LOGGED IN add the cart items to BROWSER'S CACHE

    public CartResponseDto addItem(Long userId, CartItemRequestDto request) {

        CartResponseDto cartDto = getCart(userId);
        if (cartDto.cartId() == null)
            cartDto = createCart(userId);

        Cart cart = cartMapper.toEntity(userId, cartDto);
        CartItem newItem = request.toEntity();

        // TODO
        // Here you have to make a soft check with INVENTORY SERVICE to see if quantity added in
        // cart is more than available in INVENTORY if so round up to MAX AVAILABLE QUANTITY

        InventoryResponse inventory = inventoryClient.getInventory(newItem.getProductId());

        if (inventory == null) {
            // 1. Log that the item does not exist
            System.out.println("Warning: Product " + newItem.getProductId() + " does not exist in inventory catalog (Possibly Connection Error). Creating dummy inventory.");

            // 2. Create dummy inventory where available items == required items
            inventory = InventoryResponse.dummyOf(newItem.getProductId(), newItem.getQuantity());
        }


        //  Look if product exists already in user's cart
        Optional<CartItem> itemExists = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(newItem.getProductId()))
                .findFirst();

        // Product exists -> add to the same product
        if (itemExists.isPresent()) {
            CartItem existingItem = itemExists.get();

            if (inventory.available() < existingItem.getQuantity() + newItem.getQuantity())
                existingItem.setQuantity(inventory.available());
            else
                existingItem.setQuantity(existingItem.getQuantity() + newItem.getQuantity());

        } else {
            int maxQuanitity = newItem.getQuantity();
            if (inventory.available() < newItem.getQuantity()) {
                maxQuanitity = inventory.available();
            }

            newItem.setQuantity(maxQuanitity);
            cart.getItems().add(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);

        return CartResponseDto.fromEntity(updatedCart);
    }




    public CartResponseDto deleteItem(Long userId, CartItemRequestDto request) {

        CartResponseDto cartDto = getCart(userId);
        if (cartDto.cartId() == null)
            cartDto = createCart(userId);

        Cart cart = cartMapper.toEntity(userId, cartDto);
        CartItem deleteItem = request.toEntity();

        // TODO
        // Have to throw a message in frontend ("Item not found"), this one is for server logs and results 500 in frontend
        //  Look if product exists already
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(deleteItem.getProductId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart: " + deleteItem.getProductId()));

        // TODO
        // Could improve this multiple decrease request using frontend with timer
        // Start a timer for sometime, if item count remains 0 PUBLISH KAFKA MESSAGE  to mongodb

        if (cartItem.getQuantity() > 0)
            cartItem.setQuantity(Math.max(0, cartItem.getQuantity() - deleteItem.getQuantity()));

        if (cartItem.getQuantity() == 0)
            cart.getItems().remove(cartItem);

        Cart updatedCart = cartRepository.save(cart);

        return CartResponseDto.fromEntity(updatedCart);
    }



    public CheckoutResponse checkout(Long userId) {

        CartResponseDto cartDto = getCart(userId);

        if (cartDto.items() == null || cartDto.items().isEmpty()) {
            throw new IllegalStateException("Cannot checkout an empty cart");
        }

        List<CheckoutItemRequest> items = cartDto.items()
                        .stream()
                        .map(item ->
                                new CheckoutItemRequest(
                                        item.getProductId(),
                                        item.getQuantity()
                                ))
                        .toList();

        CheckoutRequest request = new CheckoutRequest(
                        UUID.randomUUID(),
                        cartDto.cartId(),
                        userId,
                        cartDto.updatedAt(),
                        items
                );

        CheckoutResponse response = checkoutClient.createOrder(request);

        // The order now owns these items, so empty the cart. Only reached if checkout-service accepted the order
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        return response;
    }
}
