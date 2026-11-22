# Arqora Storefront

A modern, feature-based React and TypeScript e-commerce storefront with an isolated Admin Analytics Console, multi-theme customization powered by CSS variables and Tailwind CSS v4, and end-to-end integration with a FastAPI OpenAPI 3.1.0 backend.

---

## Features

- **Customer Storefront**
  - Live product catalog with search, category filter pills, pagination, and stock indicators (`Low Stock` / `Sold Out`).
  - Product detail view with unit stock counts, quantity picker, and category-based recommendations.
  - Persistent shopping bag (`localStorage`) with quantity steppers, item removal, and live subtotal/tax calculation.
- **Checkout & Order Management**
  - Authenticated checkout with shipping address entry and payment provider selection (**Stripe** and **bKash**).
  - Order history with fulfillment/payment status badges (`paid`, `pending`, `cancelled`, `failed`), itemized order confirmation views, and pending order cancellation.
- **Authentication & Role Isolation**
  - Customer registration and login integrated with `/api/v1/auth/*`.
  - Automatic JWT Bearer token attachment and silent `401` refresh-token rotation in Axios.
  - Strict role separation via `CustomerGuard` and `AdminGuard`: administrators are routed directly to `/admin` and kept separate from customer shopping pages.
- **Admin Console & Analytics (`/admin`)**
  - **Overview**: KPI cards (Paid Sales Revenue, Total Orders & Average Order Value, Catalog Products & Stock Alerts, Inventory Valuation & Categories), interactive SVG charts (**Sales Trend** with `7D`/`30D`/`All` and `Revenue`/`Orders` toggles, **Order Status Donut**, and **Inventory by Category**), Inventory Alerts, Top Selling Products, and Recent Sales preview.
  - **Sales History**: Searchable, status-filterable order list with expandable line items and pending order cancellation.
  - **Products & Categories Management**: Create, search, inspect, and delete catalog products and categories.
- **Centralized Multi-Theme System & Configurable Currency**
  - 5 built-in themes (`classic`, `midnight`, `sand`, `forest`, `ocean`) defined via root CSS custom properties and mapped into Tailwind CSS v4 (`@theme inline`).
  - Runtime `ThemeSwitcher` persisted to `localStorage` and configurable defaults via `.env` (`VITE_THEME`, `VITE_CURRENCY`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` + CSS variables) |
| Routing | React Router 8 |
| HTTP Client | Axios (with request/response interceptors) |
| Linting | ESLint (`typescript-eslint`, `react-hooks`, `react-refresh`) |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- Running instance of the Arqora e-commerce backend (default: `http://localhost:8000/api`)

### Installation

```bash
git clone https://github.com/jobayadurrasid/arqora-storefront.git
cd arqora-storefront
npm install
```

### Environment Configuration

Copy the tracked [`.example.env`](.example.env) template to `.env` in the project root (`.env` is ignored by Git) and update the values for your environment:

```bash
cp .example.env .env
```



| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | — | Base URL of the backend API (e.g., `http://localhost:8000/api`) |
| `VITE_CURRENCY` | `USD` | Display and checkout currency code (e.g., `BDT`, `GBP`, `USD`, `CNY`) |
| `VITE_THEME` | `classic` | Default theme ID (`classic`, `midnight`, `sand`, `forest`, `ocean`) |
| `VITE_LOGO` | `ARQORA` | Brand logo text (e.g., `ARQORA`) or a direct online image URL (e.g., `https://example.com/logo.png`) |
| `VITE_APP_NAME` | `Arqora Store` | Application display name |
| `VITE_APP_ENV` | `development` | Runtime environment label |

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173/`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Run TypeScript type checking (`tsc -b`) and build production assets |
| `npm run lint` | Run ESLint across the repository |
| `npm run preview` | Preview the production build locally |

---

## Project Structure

```text
src/
├── components/
│   └── common/              # Shared UI components (Navbar, Footer, ThemeSwitcher)
├── config/                  # Environment config and central theme registry (config.ts, themes.ts)
├── features/
│   ├── account/             # Admin Console, route guards, sales history, SVG charts, analytics utils
│   ├── auth/                # Authentication API, LoginPage, RegisterPage, types
│   ├── cart/                # Shopping bag page (CartPage)
│   ├── categories/          # Categories API client
│   ├── checkout/            # Payments API client and CheckoutPage
│   ├── orders/              # Orders API client, OrdersPage, OrderDetailPage
│   └── products/            # Products API client, CatalogPage, ProductDetailPage
├── layouts/                 # Page shells (RootLayout for storefront, AdminLayout for /admin)
├── lib/                     # Configured Axios instance with Bearer & refresh-token interceptors
├── routes/                  # React Router configuration
├── stores/                  # React contexts (AuthProvider, CartProvider, ThemeProvider)
├── styles/                  # Centralized root CSS variable theme palettes (themes.css)
└── types/                   # Backend OpenAPI TypeScript schemas (api.ts)
```

---

## Application Routes

| Route | View | Access |
|---|---|---|
| `/` | Product Catalog (`CatalogPage`) | Public / Customer (`CustomerGuard`) |
| `/products/:productId` | Product Details (`ProductDetailPage`) | Public / Customer (`CustomerGuard`) |
| `/cart` | Shopping Bag (`CartPage`) | Public / Customer (`CustomerGuard`) |
| `/checkout` | Order Checkout (`CheckoutPage`) | Authenticated Customer (`CustomerGuard`) |
| `/orders` | Order History (`OrdersPage`) | Authenticated Customer (`CustomerGuard`) |
| `/orders/:orderId` | Order Detail & Invoice (`OrderDetailPage`) | Authenticated Customer (`CustomerGuard`) |
| `/login` | Sign In (`LoginPage`) | Public |
| `/register` | Customer Registration (`RegisterPage`) | Public |
| `/admin` | Admin Analytics & Management Console | Admin Only (`AdminGuard`) |

---

## Backend API Integration

Consumes `/api/v1/*` endpoints matching the backend OpenAPI 3.1.0 specification:

| Domain | Endpoints |
|---|---|
| **Authentication** | `POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/refresh`, `GET /v1/auth/me` |
| **Categories** | `GET /v1/categories/`, `POST /v1/categories/`, `GET /v1/categories/{id}`, `PUT /v1/categories/{id}`, `DELETE /v1/categories/{id}`, `GET /v1/categories/{id}/recommendations` |
| **Products** | `GET /v1/products/`, `POST /v1/products/`, `GET /v1/products/{id}`, `PUT /v1/products/{id}`, `DELETE /v1/products/{id}` |
| **Orders** | `GET /v1/orders/`, `POST /v1/orders/`, `GET /v1/orders/{id}`, `POST /v1/orders/{id}/cancel` |
| **Payments** | `POST /v1/payments/checkout`, `GET /v1/payments/{id}`, `POST /v1/payments/execute` |

---

## Theming & Customization

Themes are driven by CSS custom properties in `src/styles/themes.css` and mapped to Tailwind utility tokens (`bg-primary`, `bg-surface`, `bg-muted`, `text-secondary`, `bg-action`, `text-success`, `text-danger`, etc.) in `src/index.css`.

- **Change default theme:** Update `VITE_THEME` in `.env` to `classic`, `midnight`, `sand`, `forest`, or `ocean`.
- **Add a new theme:**
  1. Add a `[data-theme="<id>"]` block defining all `--theme-*` variables in `src/styles/themes.css`.
  2. Register the theme metadata and swatch preview in `src/config/themes.ts` (`ThemeId` and `THEMES`).

---

## Branching & Commit Convention

- **Branches:** Feature branches (`feat/*`, `fix/*`) are created from `qa` and merged back into `qa` via Pull Requests before promoting to `main`.
- **Commits:** Follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat(...)`, `fix(...)`, `refactor(...)`, `chore(...)`, `docs(...)`).
