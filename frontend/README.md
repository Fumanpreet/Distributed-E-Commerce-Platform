# ShopCore frontend

React + Vite + TypeScript storefront for the `e-commerce-core` Spring Boot API.

## Prerequisites
- Node 22 (`nvm install 22`, then `nvm use` in this folder)
- `e-commerce-core` running on http://localhost:8080. For checkout and order tracking, also run checkout-service (8082) and inventory-service (8081).

## Run
```bash
cd frontend
nvm use
npm install
npm run dev        # http://localhost:5173, hot reload on save
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with `/api` → `localhost:8080` proxy |
| `npm run test` | Unit/component tests in watch mode |
| `npm run test:run` | Tests once (CI) |
| `npm run lint` / `npm run typecheck` | Static checks |
| `npm run build` then `npm run preview` | Production build + local preview |

## Pages
`/` products and search · `/products/:id` detail and add to cart · `/login` · `/register` · `/cart` (login required) · `/orders/:orderId` live order status (login required)

## How it talks to the backend
The browser only talks to the Vite server. Requests to `/api/*` are proxied to Spring Boot with the `/api` prefix removed, so the session cookie is same-origin and no CORS config is needed. In production, serve `dist/` behind a reverse proxy (e.g. nginx) that does the same `/api` forwarding.
