import { createBrowserRouter, Link } from 'react-router'
import { Layout } from '../components/layout/Layout'
import { Message } from '../components/ui/Message'
import { LoginPage } from '../features/auth/LoginPage'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { RegisterPage } from '../features/auth/RegisterPage'
import { CartPage } from '../features/cart/CartPage'
import { ProductDetailPage } from '../features/catalog/ProductDetailPage'
import { ProductListPage } from '../features/catalog/ProductListPage'
import { OrderStatusPage } from '../features/orders/OrderStatusPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <ProductListPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'cart', element: <CartPage /> },
          { path: 'orders/:orderId', element: <OrderStatusPage /> },
        ],
      },
      {
        path: '*',
        element: (
          <Message
            title="Page not found"
            action={
              <Link to="/" className="text-indigo-600 hover:underline">
                Go home
              </Link>
            }
          />
        ),
      },
    ],
  },
])
