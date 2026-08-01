# 🏺 Kroma — Luxury Ceramic Artifacts & Vases

Kroma is an enterprise-grade, luxury e-commerce platform designed for premium decorative flower vases and ceramic artifacts. Modeled with a minimal, Apple-inspired design aesthetic, Kroma delivers a visually stunning shopping experience paired with a robust administrative management system.

Built on **Next.js 16 (App Router)**, **Supabase (PostgreSQL, Auth & Storage)**, and **Tailwind CSS v4**, this application is designed for modern performance, clean code architecture, and smooth micro-interactions.

---

## 💎 Design Philosophy & UX

Kroma's frontend is designed to feel premium, featuring:
- **Elegance & Whitespace**: Generous typography hierarchies using serif styling (`Playfair Display`) and sans-serif readability (`Inter`).
- **TACTILE Micro-Interactions**: Fluid page transitions, spring-based cart triggers, slide-over menus, and hover image crossfades built on **Framer Motion**.
- **Interactive States**: Shimmer skeleton loaders for zero-layout-shift (CLS) states, floating form labels, and interactive star ratings.
- **Dark Mode Friendly**: Adaptable and modern color palettes that pop on different displays.

---

## 🚀 Key Features

### 🛍️ Premium Storefront
* **Dynamic Homepage**: Features an auto-rotating hero slides carousel, category collections, new arrivals, best sellers, and dynamic trust badges.
* **Product Listing Page (PLP)**: Powerful real-time client filters (by category, price ranges, sort options) synced directly to URL search parameters.
* **Product Detail Page (PDP)**: Visual thumbnail strip selector, variant swatches, quantity constraints, responsive accordion specs, and user reviews.
* **Seamless Checkout Flow**: Interactive shipping detail collector, order totals calculation, and integrated checkout submission.
* **User Accounts Dashboard**: Comprehensive user profiles, default shipping address books, wishlist collections, and color-coded order status timeline history.

### 🛡️ Administrative Console (`/admin`)
* **Live KPI Analytics**: Total Revenue, Total Orders, Total Customers, and Average Order Values with period-over-period variance metrics.
* **Recharts Data Visualizations**: Smooth line area charts mapping revenue trends and product metrics.
* **Product & Inventory Management**: Full CRUD capabilities supporting drafts/published states, SKU codes, stock quantities, and drag-and-drop image re-ordering.
* **Category Tree Management**: Nested sub-category trees with custom display icons.
* **Order Fulfilment Timeline**: Order details, shipping address validation status, tracking number updates, and interactive fulfillment status timelines.
* **Brand & Site Customizer**: Direct control over header/footer logo uploads, global site contact info, currency formats, tax rates, announcement bars, and site-wide promotional banners.

---

## 📁 Project Structure

The project conforms to a clean, component-driven directory structure:

```
├── public/                 # Static assets (sample images, logo templates)
├── scripts/                # Database migration scripts and seed tools
├── src/
│   ├── app/                # Next.js App Router (Storefront, Admin Layouts, API Routes)
│   │   ├── (storefront)/   # Customer shopping pages & layouts
│   │   ├── admin/          # Protected administration panels
│   │   └── api/            # API Route handlers (Checkout, Admin alerts)
│   ├── components/
│   │   ├── admin/          # Admin-specific layouts, sidebars, and tables
│   │   ├── providers/      # Global state context providers (Auth, Toasts)
│   │   ├── storefront/     # Header, Footer, Cart drawers, search overlays
│   │   └── ui/             # Reusable atomic elements (Buttons, Skeletons, Modals)
│   ├── hooks/              # Custom hooks (useCart, useAuth, etc.)
│   ├── lib/                # Database drivers, utility functions, and sample data templates
│   └── types/              # Unified TypeScript definitions
```

---

## 💾 Database Architecture (Supabase / PostgreSQL)

Kroma connects directly to PostgreSQL tables via Supabase. Below is an overview of the schema:

1. **`profiles`**: Links to `auth.users`, storing `full_name`, `avatar_url`, and administrative `role`.
2. **`products`**: Primary item table tracking `title`, `slug`, `sku`, `price`, `sale_price`, `stock_quantity`, `status`, and SEO metadata.
3. **`categories`**: Stores hierarchical category groups with sorting orders.
4. **`product_images`**: Multi-image associations per product for thumbnail crossfades.
5. **`orders`**: Holds generated invoice order numbers, totals, discount breakdowns, payment state, and fulfillment stages.
6. **`order_items`**: Line items matching orders with purchased quantity and price logs.
7. **`order_timeline`**: Event timeline logging status modifications (e.g., Shipped -> Delivered).
8. **`reviews`**: Ratings and reviews mapped to user profiles and products.
9. **`site_settings`**: Active brand customizable settings, logos, and taxes.

*The full SQL schema migrations can be found in `schema.sql` and `scripts/migration_additions.sql`.*

---

## ⚙️ Local Development Setup

To run the application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Bhagath63601/Kroma.git
cd kroma
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Initialization
Run the schema setup SQL in your Supabase SQL editor or run migrations to initialize tables, row-level security (RLS) rules, and database functions.

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
