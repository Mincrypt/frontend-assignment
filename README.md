# Product Admin Dashboard

A production-grade, responsive Product Admin Dashboard built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and **Axios**, powered by the **DummyJSON API** ([https://dummyjson.com](https://dummyjson.com/)).

This application was engineered without third-party data-fetching libraries (no React Query, SWR) or pre-built table/pagination libraries. All features—including pagination, search debouncing, request cancellation, category filtering, multi-field sorting, route protection, and CRUD mutation overlays—are built from scratch.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend Mock API**: [DummyJSON API](https://dummyjson.com/)

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (or yarn / pnpm)

### Installation
```bash
# Clone or navigate into the project directory
cd "frontend assignment"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

### Production Build
```bash
# Build optimized static and dynamic routes
npm run build

# Start the production server
npm start
```

---

## Test Login Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin User** | `emilys` | `emilyspass` |

> 💡 *A **"Quick fill demo credentials"** button is integrated directly into the login form for testing.*

---

## Key Features

- **Authentication & Route Protection**:
  - Secure login with form validation, rate-limiting, and error messaging.
  - Persistent authentication surviving browser refresh (synchronized via `localStorage` and cookies).
  - Protected dashboard routes (`/products`, `/products/[id]`, `/products/new`, `/products/[id]/edit`) with automatic redirects for unauthenticated users and zero redirect loops.
  - Header user avatar badge and one-click Logout.

- **Responsive Product Listing**:
  - **Desktop View**: Rich data table with sortable columns, product image thumbnails, badges, prices, star ratings, stock status, and actions.
  - **Mobile/Tablet View**: Responsive card grid optimized for touchscreens.

- **Manual Pagination**:
  - Page navigation buttons with smart ellipsis windowing (`1 ... 4 5 6 ... 20`).
  - Dynamic page size selector (`10`, `20`, `50` items per page).
  - Accurate range indicators (`Showing 21–40 of 194 products`).
  - Strict boundary disabling on the first and last pages.

- **Debounced Search & Stale Request Cancellation**:
  - Search input with 350ms debounce.
  - Integrated `AbortController` cancellation ensuring that slow, in-flight responses from earlier keystrokes never overwrite newer search results.
  - Automatic pagination reset to page 1 upon search term changes.

- **Category Filter**:
  - Populated dynamically from `/products/categories`.
  - Filters products by category, updates URL state, and resets to page 1.
  - Gracefully addresses DummyJSON's limitation regarding concurrent search and category filtering.

- **Multi-Criteria Sorting**:
  - Price: Low → High (`price-asc`), High → Low (`price-desc`)
  - Rating: High → Low (`rating-desc`), Low → High (`rating-asc`)
  - Title: A → Z (`title-asc`), Z → A (`title-desc`)
  - Click-to-sort directly from table headers or via the filter toolbar dropdown.

- **URL Query State Synchronization**:
  - Full synchronization of `page`, `limit`, `search`, `category`, and `sort` parameters with the browser URL (`/products?page=2&limit=20&search=phone&category=smartphones&sort=price-asc`).
  - Bookmarkable and shareable URLs.
  - Sanitization with safe fallback defaults for invalid parameters (`?page=abc`, `?page=-5`, `?limit=invalid`).

- **Product Details & Customer Reviews**:
  - Dedicated route `/products/[id]`.
  - Interactive multi-image gallery with thumbnail switcher.
  - Comprehensive metadata: stock badges, SKU codes, dimensions, weight, shipping info, and warranty terms.
  - Customer review list with star ratings, reviewer names, dates, and feedback comments.
  - Contextual 404 "Product Not Found" screen for invalid product IDs (e.g. `/products/999999`).

- **Full CRUD with Simulated Mutation Persistence**:
  - **Add Product** (`/products/new`): Comprehensive client-side validation, live thumbnail preview, and submission rate-limiting.
  - **Edit Product** (`/products/[id]/edit`): Pre-populates existing data, validates inputs, and updates catalog state.
  - **Delete Product**: Confirmation modal with danger warning and loading state.
  - **Local State Overlay**: Because DummyJSON does not persist mutations on their server, a local context overlay reflects all created, updated, and deleted products in real-time across list and detail views.

- **Loading, Empty, and Error States**:
  - Shimmer skeleton loaders for tables, cards, and product detail screens.
  - Tailored empty states for search queries, categories, and empty lists with quick reset buttons.
  - User-friendly error cards with a functional **"Retry"** trigger.

---

## API Endpoints Used

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/auth/login` | `POST` | Authenticate user and obtain JWT token |
| `/auth/me` | `GET` | Retrieve authenticated user profile |
| `/products` | `GET` | Fetch paginated products (`limit`, `skip`, `sortBy`, `order`) |
| `/products/search` | `GET` | Search products by keyword (`q`, `limit`, `skip`, `sortBy`, `order`) |
| `/products/categories`| `GET` | Retrieve category list |
| `/products/category/:category` | `GET` | Fetch products filtered by category |
| `/products/:id` | `GET` | Fetch individual product details |
| `/products/add` | `POST` | Create a new product (simulated) |
| `/products/:id` | `PUT` | Update existing product properties (simulated) |
| `/products/:id` | `DELETE` | Delete a product (simulated) |

---

## Architecture & Implementation Decisions

### 1. Centralized Shared Axios Setup (`src/lib/api.ts`)
Instead of making ad-hoc `fetch` or `axios` calls in components, the entire application relies on a single configured Axios instance:
- **Base URL**: `https://dummyjson.com`.
- **Request Interceptor**: Extracts the authentication token from `localStorage` / cookie storage and injects the `Authorization: Bearer <token>` header.
- **Response Interceptor**: Normalizes server error messages, intercepts `401 Unauthorized` responses to clear invalid sessions, and safely ignores aborted cancellation errors (`CanceledError`).

### 2. Isolated API Service Layer (`src/services/`)
- `authService.ts`: Encapsulates login, user profile verification, and token refresh.
- `productService.ts`: Encapsulates all product listing, search, category filtering, detail fetching, and CRUD endpoints. Components consume these typed services rather than invoking Axios directly.

### 3. Search Debounce & Stale Request Cancellation (`AbortController`)
In high-latency networks, a user typing `phone` → `iphone` → `iphone 15` could receive the slower response for `phone` *after* `iphone 15`, causing the UI to overwrite fresh results with stale data.
- **Debounce**: 350ms delay via custom hook `useDebounce`.
- **Request Cancellation**: Each query triggers an `AbortController`. If a new query or filter change occurs before the previous network call resolves, `controller.abort()` cancels the pending Axios request via its `signal`. Stale responses are discarded before touching state.

### 4. DummyJSON Category vs. Search Limitation
DummyJSON provides two disjoint endpoints: `/products/search?q={query}` and `/products/category/{category}`. The API does not support combined server-side search querying and category filtering in a single request.
- **Chosen Solution**: When both a category and a search term are supplied, the application fetches the category dataset and applies high-speed client-side filtering matching the search term across `title`, `brand`, and `description`. A helpful notice badge is displayed informing the user of the active filter mode.

### 5. Mutation Persistence Simulation (`ProductContext`)
DummyJSON returns mock success payloads for POST/PUT/DELETE calls without modifying backend database records.
- **Chosen Solution**: `ProductContext` maintains a lightweight local overlay of:
  - `localAddedProducts`: Prepend new items to the catalog.
  - `localUpdatedProducts`: Deep-merge modified fields over API items.
  - `localDeletedProductIds`: Filter out deleted products from lists and detail views.
This ensures a realistic user experience throughout the active session.

---

## Real Problem Encountered & Solution

### Problem: Next.js App Router CSR Bailout during Static Prerendering
**Symptom**: During `npm run build`, Next.js failed with the error:
`⨯ useSearchParams() should be wrapped in a suspense boundary at page "/login" and "/products"`.

**Root Cause**: In Next.js 14/15 App Router, components accessing dynamic search parameters (`useSearchParams()`) on client pages bail out of static rendering unless wrapped in a React `<Suspense>` boundary.

**Solution**:
Refactored `LoginPage` and `ProductsDashboardPage` to decouple the parameter-consuming logic into inner subcomponents (`LoginContent` and `ProductsDashboardContent`) wrapped with a top-level `<Suspense fallback={<TableSkeleton />}>`. This allowed static optimization to succeed cleanly across all routes.

---

## AI Usage Declaration

AI assistance (Google DeepMind Antigravity / Gemini) was utilized during the development of this project for:
- Architecture planning and design specification.
- Structuring type definitions and boilerplate components.
- Crafting responsive Tailwind CSS layouts, accessibility helpers, and skeleton loaders.
- Writing integration test scripts and documentation.

All requirements, edge cases, custom pagination logic, request cancellation, and styling were verified and tested end-to-end.
