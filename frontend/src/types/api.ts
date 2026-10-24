// Mirrors the Spring Boot DTOs in e-commerce-core. Keep in sync when the backend changes.

export interface User {
  id: number
  email: string
  name: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// catalog/dto/ProductResponseDto.java
export interface Product {
  id: string
  description: string
  noOfReviews: number
  price: number
}

// cart/dto/CartResponseDto.java
export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  cartId: string | null
  items: CartItem[]
  createdAt: string | null
  updatedAt: string | null
}

export interface CartItemRequest {
  productId: string
  quantity: number
}

export interface CheckoutResponse {
  orderId: string
  status: OrderStatus
}

// Union of the core and checkout-service OrderStatus enums
export type OrderStatus =
  | 'PENDING_INVENTORY'
  | 'INVENTORY_RESERVED'
  | 'INVENTORY_REJECTED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'

// order/dto/OrderStatusDto.java
export interface Order {
  orderId: string
  status: OrderStatus
  updatedAt: string
}

// order/dto/OrderSummaryDto.java (GET /orders, newest first)
export interface OrderSummary {
  orderId: string
  status: OrderStatus
  // Total quantity across all lines
  itemCount: number
  createdAt: string
  updatedAt: string
}

// exception/GlobalExceptionHandler.java ErrorResponse
export interface ApiError {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
}
