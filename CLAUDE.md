# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickCart is a Next.js 15 eCommerce frontend application built with React 19, Tailwind CSS, and App Router. The project is frontend-focused with API integration for backend services. The UI is primarily in Vietnamese.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### App Structure (Next.js App Router)

- **Pages**: Located in `app/` directory using file-based routing
  - Customer routes: `/`, `/all-products`, `/product/[id]`, `/cart`, `/orders`, `/profile`, `/login`, etc.
  - Seller routes: `/seller/*` with dedicated layout
  - Lookbook routes: `/lookbook/[id]`
- **Components**: Organized in `components/` with a sub-folder for seller-specific components
- **Context**: Global state managed via `context/AppContext.jsx`
- **Assets**: Static images and product data in `assets/`
- **Lib**: Utility functions for API calls (`lib/api.js`) and auth (`lib/authSeller.js`)

### State Management

The app uses React Context API via `AppContext` for global state management:

- **Products**: Fetched from backend API and transformed to frontend format
- **Lookbooks**: Fashion lookbook collections with associated products/variants
- **Cart**: Dual-mode cart (authenticated users sync with backend, guests use localStorage)
- **User Authentication**: Token-based auth with localStorage persistence
- **Toast Notifications**: Custom toast system for user feedback

### Key Context Functions

```javascript
// Product operations
fetchProductData()        // Fetch all products
fetchProductById(id)      // Fetch single product by ID or slug

// Lookbook operations
fetchLookbooks()          // Fetch all lookbooks
fetchLookbookById(id)     // Fetch single lookbook by ID or slug

// Cart operations
addToCart(itemId, variantId)                    // Add item to cart
updateCartQuantity(itemId, quantity, variantId) // Update cart item quantity
fetchCart()                                     // Sync cart from backend
getCartCount()                                  // Get total items in cart
getCartAmount()                                 // Get total cart amount
getCartDetails()                                // Get detailed cart items

// User operations
fetchUserData()           // Check and load user authentication state

// Toast notifications
showToast(message, type)  // Show toast notification
hideToast()              // Hide toast notification
```

### Data Transformation

The app transforms backend API responses to frontend data structures:

**Products**: Backend `product_id` → Frontend `productId`, `product_name` → `name`, variants include `sku`, `price`, `size`, `color`, `assets`

**Lookbooks**: Backend `lookbook_id` → Frontend `lookbookId`, contains items with variants and product references

**Cart**: Backend `cart_detail` array → Frontend cart object with variant details, prices, and product info

### Authentication Flow

1. User logs in via `/login` which calls `/auth/login` endpoint
2. Token stored in `localStorage` as `access_token`
3. `fetchUserData()` checks for token and sets `userData` state
4. Cart syncs from backend if user is authenticated, otherwise uses localStorage
5. Protected routes check for token and redirect to `/login` if missing
6. Logout clears token and reloads page

### Cart Implementation

- **Authenticated Users**: Cart synced with backend via API calls (`/cart/add`, `/cart/update`, `/cart/${variantId}`)
- **Guest Users**: Cart stored in localStorage as JSON
- **Cart Key Format**: `{productId}_{sku}` for items with variants
- **Display**: Cart details include product name, variant info (size, color), price, quantity, images

### API Integration

Base API URL configured via `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3618`)

**API Helper** (`lib/api.js`):
- `apiFetch(url, options)`: Wrapper for fetch with error handling and JSON parsing
- `getAuthHeaders(token)`: Returns Authorization headers for authenticated requests

**Common Endpoints**:
- `/products` - Get all products
- `/products/{id}` - Get product by ID or slug
- `/lookbooks` - Get all lookbooks
- `/lookbooks/{id}` - Get lookbook by ID or slug
- `/cart` - Get user's cart
- `/cart/add` - Add item to cart
- `/cart/update` - Update cart item quantity
- `/cart/{variantId}` - Delete cart item
- `/auth/login` - User login
- `/auth/register` - User registration

### Styling

- **Tailwind CSS**: Used throughout with custom configuration
- **Colors**: Orange accent (`orange-600`) for CTAs, gray scale for text
- **Custom Grid**: `grid-cols-auto` for responsive product grids
- **Images**: Next.js Image component with unoptimized mode and remote patterns enabled
- **Responsive**: Mobile-first design with `md:` and `lg:` breakpoints

### Seller Dashboard

Separate layout and routes under `/seller` with dedicated Navbar, Sidebar, and Footer components. This section appears to be for managing products and orders (seller-side functionality).

### Component Patterns

- All pages and components use `'use client'` directive for client-side rendering
- Context consumed via `useAppContext()` hook
- Next.js router accessed via `router` from context
- Image optimization disabled globally (`unoptimized: true`)
- Vietnamese language throughout UI

### Path Aliases

- `@/*` maps to project root (configured in `jsconfig.json`)

## Environment Variables

Required environment variables (see `.env`):

```bash
NEXT_PUBLIC_CURRENCY=VND                       # Display currency
NEXT_PUBLIC_API_URL=http://localhost:3618      # Backend API URL
```

Optional (currently unused in codebase but defined):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `INNGEST_SIGNING_KEY`
- `INNGEST_EVENT_KEY`
- Cloudinary credentials

## Important Notes

- The app is **frontend-only** - all data comes from external API
- Authentication uses simple token-based auth (not Clerk despite env vars)
- Cart requires authentication - guests are redirected to login when accessing `/cart`
- Product variants are critical - most operations use `sku` as variant identifier
- Vietnamese language is used throughout the UI
- Demo credentials shown on login page (should be removed in production)
- The project includes a chatbot component (`components/Chatbot.jsx`)
- Toast notifications use `react-hot-toast` library
