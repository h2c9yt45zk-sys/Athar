# Athar (أثر) - Master Architectural & Developer Documentation

Welcome to the definitive master documentation for **Athar (أثر)**. This document serves as an exhaustive, technical reference for human software engineers, system architects, and AI agent developers working on or integrating with the Athar codebase.

---

## 1. Project Idea & Concept

### 1.1 Executive Summary
**Athar (أثر)** is an Egyptian luxury heritage e-commerce Single-Page Application (SPA) built for handcrafted high-end apparel and accessories. The platform showcases premium women's wear, men's luxury attire, and Islamic heritage collections—featuring hand-embroidered kaftans, pure linen abayas, royal velvet gowns, and bespoke heritage vests.

The application operates as a dual-portal platform:
1. **Public Customer Portal**: An immersive, high-aesthetics storefront where users can explore collections, inspect detailed product specifications (sizes, colors, image galleries), add items to an interactive cart, execute multi-step checkouts with local & electronic payment methods (including InstaPay & Vodafone Cash receipt uploads), copy a generated order code, and track order fulfillment in real-time.
2. **Admin Management Portal (`/admin`)**: A comprehensive store dashboard for store administrators to manage live customer orders, update order fulfillment stages, verify electronic payment screenshots, search/filter orders by normalized order codes or status, and conduct full CRUD operations on store products and collection headers.

### 1.2 Core Business Problem Solved
Traditional Egyptian and MENA heritage fashion houses often struggle with digital transformation due to fractured sales channels (e.g., manual WhatsApp messaging, Instagram DMs, unverified bank transfer screenshots). Athar solves these core business challenges by providing:
- **Structured Digital Checkout**: Captures complete customer delivery profiles with strict Egyptian phone validation (`11-digit` numeric check).
- **Payment Verification Workflow**: Supports electronic wallet transfers (InstaPay & Vodafone Cash) with mandatory receipt screenshot uploads, giving admins visual verification capability before order processing.
- **Unique Order Tracking**: Assigns deterministic, collision-resistant order codes (`ATHAR-XXXXX`) allowing customers to track their order status without needing traditional password authentication.
- **Client-Side Persistence & Backend Readiness**: Out-of-the-box browser storage persistence (`localStorage`) with ready-to-use Supabase JavaScript SDK integration for seamless cloud backend migration.

---

## 2. Tech Stack & Tooling

The application leverages modern web technologies built around performance, type safety, modular architecture, and rich aesthetic design.

| Technology / Tool | Version | Purpose in Athar Codebase | Technical Justification |
| :--- | :--- | :--- | :--- |
| **React** | `^18.3.1` | Core UI Library | Component-based view architecture, hooks (`useState`, `useEffect`, `useMemo`, `useContext`), custom providers. |
| **TypeScript** | `^5.7.3` | Type Safety & Interfaces | Strict type definitions (`Product`, `CartItem`, `Order`, `PaymentStatus`, etc.) ensuring compile-time safety and preventing runtime type errors. |
| **Vite** | `^6.1.0` | Build Tool & Dev Server | Ultra-fast HMR (Hot Module Replacement), optimized bundling with `@vitejs/plugin-react`, path aliasing `@/ -> src/`. |
| **React Router DOM** | `^6.29.0` | Client-Side Routing | SPA routing (`BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useLocation`) supporting deep links (`/product/:id`, `/tracking`, `/admin`). |
| **Tailwind CSS** | `^3.4.17` | Utility-First Styling | Customized design system defined in `tailwind.config.js` with bespoke colors, luxury typography tokens, spacing, and responsive breakpoints. |
| **Lucide React** | `^0.475.0` | Vector Iconography | Lightweight SVG icons used extensively across the Admin Dashboard (`BarChart3`, `Store`, `Eye`, `Copy`, `Plus`, `PencilLine`, etc.). |
| **Material Symbols** | CDN / CSS | Google Heritage Icons | Display icons (`shopping_bag`, `local_shipping`, `verified`, `close`, `expand_more`) embedded in navigation and product details. |
| **clsx & tailwind-merge**| `^2.1.1` / `^3.0.1` | Class Utility Merging | Safe dynamic class concatenation and resolution of Tailwind utility overrides. |
| **Supabase Client** | `^2.48.1` | Backend Database SDK | Official `@supabase/supabase-js` client initialized in `src/app/lib/supabase.js` for future cloud database syncing. |
| **Swiper** | `^10.0.0` | Touch-enabled Sliders | Carousel library included for interactive media components and touch swiping. |
| **pnpm** | Workspaces | Package Manager | Fast, disk-space-efficient dependency management configured via `pnpm-workspace.yaml`. |

---

## 3. User Roles & Workflows

Athar supports two primary user personas: **Customer** and **Store Administrator**.

```
                         +-----------------------------------+
                         |           ATHAR PLATFORM          |
                         +-----------------------------------+
                                   /               \
                                  /                 \
                                 v                   v
                     +-------------------+   +-------------------+
                     |  Customer Portal  |   |   Admin Portal    |
                     +-------------------+   +-------------------+
                       | Browse & Search       | Monitor Statistics
                       | Product Details       | Filter & Search
                       | Cart & Checkout       | Verify Payments
                       | Electronic Payment    | Order Status Updates
                       | Receipt Upload        | Product & Category CRUD
                       | Order Tracking        | Shipping Copy & History
```

### 3.1 Customer Workflow

#### Step 1: Catalog Exploration & Product Inspection
- The customer lands on Home (`/`) or navigates to specific category pages (`/women`, `/men`, `/islamic`).
- Clicking on any product opens the Product Details view (`/product/:id`).
- On the product details page, customers can:
  - View main high-resolution images and switch via thumbnail gallery selection.
  - Select available sizes (e.g., `S`, `M`, `L`, `XL`) and color variants (e.g., `#0B1621` Royal Navy, `#5D0F22` Burgundy, `#1A3A3A` Emerald).
  - Review price information, original price strike-throughs, and handcraft quality badges.
  - Click **"إضافة إلى حقيبة التسوق"** (Add to Shopping Bag), which executes `addToCart()` via `CartContext` and automatically slides open the `CartDrawer`.

#### Step 2: Shopping Bag & Multi-Step Checkout
- The `CartDrawer` overlay opens, listing selected items, item quantities, sizes, and subtotal.
- Customers can adjust quantities (`+` / `-`) or remove items (`delete`).
- Clicking **"إتمام الطلب"** transitions the drawer to the `CheckoutForm` stage.
- Customer enters required details:
  - **Full Name** (`fullName`)
  - **Phone Number** (`phone`): Validated against strict 11-digit Egyptian phone format.
  - **Detailed Address** (`address`): City, governorate, street details.
  - **Optional Notes** (`notes`): Preferred delivery time or special requests.
  - **Payment Method Selection**:
    1. *Cash on Delivery* (`الدفع عند الاستلام`).
    2. *Electronic Payment* (`دفع إلكتروني`): Customer selects between **InstaPay** (`إنستا باي`) or **Vodafone Cash** (`فودافون كاش`). The form reveals the transfer account details (`athar.store@instapay.com` or `+966555123456`) and requires uploading a payment receipt screenshot via a file picker.

#### Step 3: Order Submission & Code Guarantee Modal
- Upon submitting, `addOrder()` processes the payload, generates a unique code (e.g., `ATHAR-1042`), clears the cart, and sets the stage to `success`.
- A high-priority modal (`isCodeModalOpen`) prompts the user with their order code (`#ATHAR-XXXXX`).
- The user must click **"نسخ الكود"** (Copy Code) to proceed. This copies the code to their clipboard and saves it to `sessionStorage` (`athar_last_order_code`).

#### Step 4: Real-Time Order Tracking
- Customer navigates to `/tracking` (or clicks "تتبع الطلب" from header/success view).
- System auto-populates the order code from URL params (`?code=ATHAR-XXXXX`) or `sessionStorage`.
- Pressing **"بحث"** filters order records and displays:
  - Current fulfillment status (`قيد الانتظار` Pending -> `قيد التجهيز` Processing -> `تم الشحن` Shipped -> `تم التوصيل` Delivered).
  - Payment method & verification status (`جاري الفحص` Under Review -> `تم القبول` Accepted -> `خطأ في الدفع` Payment Error).
  - Uploaded payment receipt screenshot (if electronic payment was used).

---

### 3.2 Admin Workflow (`/admin`)

#### View 1: Orders & Analytics Dashboard (`activeTab === 'orders'`)
1. **KPI Overview Cards**: Displays live statistics for Total Orders (128), Pending Orders (14), and Total Revenue (١٢٫٨٧٥ ر.س).
2. **Order Section Tabs**: Toggle between **Active Orders** (`filteredOrders`) and **Delivered Order History** (`historyOrders`).
3. **Sorting & Filtering**:
   - **Sort Options**: Newest (`newest`), Highest Price (`highestPrice`), or Nearest Priority Cities (`nearest`: Riyadh, Jeddah, Dammam, Mecca, Eastern Province, Khobar, Dhahran).
   - **Status Tabs**: Filter by `الكل` (All), `قيد الانتظار` (Pending), `قيد التجهيز` (Processing), `تم الشحن` (Shipped).
   - **Order Code Search**: Direct search box with code normalization (`normalizeOrderCode`).
4. **Order Detail Panel**:
   - **Shipping Information Copy**: Clicking **"نسخ تفاصيل الشحن"** copies a formatted text snippet (`Order Code`, `Customer Name`, `Phone`, `Address`, `Total Amount`) directly to clipboard for shipping couriers.
   - **Payment Screenshot Inspection**: View attached InstaPay/Vodafone Cash receipts with one-click full-resolution external preview.
   - **Payment Status Management**: Instantly toggle payment status between `جاري الفحص` (Under Review), `تم القبول` (Accepted), and `خطأ في الدفع` (Payment Error).
   - **Fulfillment Status Management**: Step-by-step state update buttons (`قيد الانتظار` -> `قيد التجهيز` -> `تم الشحن` -> `تم التوصيل`).
   - **Delivery Confirmation Modal**: Clicking "وضع الطلب في التاريخ بعد التسليم" opens a confirmation prompt before archiving the order into history.
   - **Order Restoration**: Ability to restore archived orders from history back to active processing stages.

#### View 2: Store & Catalog Management (`activeTab === 'store'`)
1. **Category Header Editor**: Select any category (`men`, `women`, `islamic`) to edit its displayed title and description in real-time, with direct links to preview page.
2. **Product Catalog Grid**: Lists all products belonging to the selected category.
3. **Product CRUD Modal**:
   - Click **"إضافة منتج جديد +"** or the pencil icon (`PencilLine`) on any product card.
   - Fill/update product properties: Name, Price, Description, Image URL or Local File Upload with instant image preview (`URL.createObjectURL`), comma-separated Sizes, comma-separated Colors, and Category assignment.
   - Click **"حفظ المنتج"** to update global state and `localStorage`.

---

## 4. Architecture & State Management

### 4.1 Data Flow Architecture

The Athar platform utilizes a centralized, unidirectional React Context state architecture. State mutations originate in components or pages, flow through `CartContext` actions, update local React state, and automatically synchronize to `localStorage` via side-effect hooks.

```
       +-----------------------------------------------------------------+
       |                        React Application                        |
       |                            (App.tsx)                            |
       +-----------------------------------------------------------------+
                                       |
                                       v
       +-----------------------------------------------------------------+
       |                          CartProvider                           |
       |                    (src/app/contexts/CartContext)               |
       |  - cart: CartItem[]         - orders: Order[]                   |
       |  - products: Product[]      - categories: Record<Key, CatInfo>  |
       |  - isCartOpen: boolean                                          |
       +-----------------------------------------------------------------+
             /                         |                         \
            /                          |                          \
           v                           v                           v
+------------------+        +-------------------+        +--------------------+
| Customer Pages   |        | UI Components     |        | Admin Dashboard    |
| - Home           |        | - Header          |        | - Order Analytics  |
| - Collections    |        | - CartDrawer      |        | - Status Update    |
| - ProductDetails |        | - CheckoutForm    |        | - Payment Review   |
| - OrderTracking  |        | - ProductCard     |        | - Product CRUD     |
+------------------+        +-------------------+        +--------------------+
           \                           |                           /
            \                          |                          /
             v                         v                         v
       +-----------------------------------------------------------------+
       |                     Local Storage Sync                          |
       | - athar_cart               - athar_orders                       |
       | - athar_products           - athar_categories                   |
       +-----------------------------------------------------------------+
                                       |
                                       v (Cloud Migration Ready)
       +-----------------------------------------------------------------+
       |                         Supabase Client                         |
       |                    (src/app/lib/supabase.js)                    |
       +-----------------------------------------------------------------+
```

---

### 4.2 State Management: `CartContext` Deep Dive

The main context provider `CartContext.tsx` (`src/app/contexts/CartContext.tsx`) manages 5 primary state vectors:

1. **`cart`** (`CartItem[]`): Current shopping cart items. Synchronized with `localStorage.getItem('athar_cart')`.
2. **`orders`** (`Order[]`): Master array of customer orders. Synchronized with `localStorage.getItem('athar_orders')`. Seeded with default orders (`ORD-1042`, `ORD-1041`, `ORD-1040`).
3. **`products`** (`Product[]`): Master product catalog. Synchronized with `localStorage.getItem('athar_products')`. Seeded with default products from `src/app/data/data.ts`.
4. **`categories`** (`Record<CategoryKey, CategoryInfo>`): Master category metadata (title & description). Synchronized with `localStorage.getItem('athar_categories')`.
5. **`isCartOpen`** (`boolean`): Controls opening/closing of the slide-over cart drawer.

#### Key Context API Methods

```typescript
interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: (open?: boolean) => void;
  addToCart: (name: string, price: number, image: string, options?: { size?: string; color?: string; productId?: string }) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, delta: number) => void;
  cartSubtotal: number;
  cartCount: number;
  clearCart: () => void;
  addOrder: (customer: CustomerOrderPayload, items: CartItem[], total: number) => Order;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Record<CategoryKey, CategoryInfo>;
  setCategories: React.Dispatch<React.SetStateAction<Record<CategoryKey, CategoryInfo>>>;
}
```

---

### 4.3 Data Structures & Type System (`src/app/types/index.ts`)

```typescript
export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: string;
  category: 'women' | 'men' | 'islamic';
  description?: string;
  sizes?: string[];
  colors?: string[];
  thumbnails?: string[];
}

export interface CartItem {
  id: number | string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'الدفع عند الاستلام' | 'دفع إلكتروني';
export type ElectronicPaymentMethod = 'إنستا باي' | 'فودافون كاش';
export type PaymentStatus = 'جاري الفحص' | 'تم القبول' | 'خطأ في الدفع';

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  total: number;
  status: 'قيد الانتظار' | 'قيد التجهيز' | 'تم الشحن' | 'تم التوصيل';
  createdAt: string;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  electronicMethod?: ElectronicPaymentMethod;
  screenshotUrl?: string;
  paymentStatus: PaymentStatus;
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
}
```

---

## 5. Folder Structure & Deep Dive

### 5.1 ASCII Directory Tree Representation

```
Athar/
├── .env                              # Environment variables (Supabase URL & Anon Key)
├── .env.example                      # Sample environment variables template
├── .gitignore                        # Git exclusion file
├── Athar Logo.jpeg                   # Official brand logo artifact
├── index.html                        # HTML5 entry document with font imports
├── package.json                      # Project dependencies & npm scripts
├── pnpm-workspace.yaml               # pnpm workspace configuration
├── postcss.config.mjs                # PostCSS configuration with Tailwind & Autoprefixer
├── tailwind.config.js                # Custom design system tokens, fonts, & colors
├── tsconfig.json                     # TypeScript compiler configuration & path aliases
├── vite.config.ts                    # Vite configuration with React plugin & path aliases
├── MD/
│   ├── ATHAR_DOCUMENTATION.md        # Master architectural & developer documentation
│   └── PROMPT.md                     # Documentation prompt requirements specification
├── resources/
│   └── README.md                     # Resource overview file
└── src/
    ├── main.tsx                      # DOM root mounting script
    ├── app/
    │   ├── App.tsx                   # Top-level application router & layout wrapper
    │   ├── components/
    │   │   ├── CartDrawer.tsx        # Slide-over cart drawer & checkout container
    │   │   ├── CheckoutForm.tsx      # Multi-step order checkout form with receipt upload
    │   │   ├── Footer.tsx            # Brand footer component with logo & contacts
    │   │   ├── Header.tsx            # Sticky navigation header with cart counter & back link
    │   │   ├── ProductCard.tsx       # Reusable product card with quick-add overlay
    │   │   ├── ProductList.tsx       # Responsive product grid container
    │   │   └── ui/
    │   │       ├── accordion.tsx     # Expandable accordion UI primitive
    │   │       ├── alert.tsx         # Alert banner UI primitive
    │   │       ├── button.tsx        # Styled button UI primitive with variants
    │   │       └── card.tsx          # Card container UI primitive
    │   ├── contexts/
    │   │   └── CartContext.tsx       # Global state provider for cart, orders, & products
    │   ├── data/
    │   │   └── data.ts               # Initial product & category data seeding
    │   ├── lib/
    │   │   └── supabase.js           # Supabase JavaScript client instance
    │   ├── pages/
    │   │   ├── AdminDashboard.tsx    # Store admin portal (orders, stats, CRUD)
    │   │   ├── Home.tsx              # Homepage featuring curated category sections
    │   │   ├── IslamicCollection.tsx # Islamic heritage collection view
    │   │   ├── MenCollection.tsx     # Men's luxury apparel view
    │   │   ├── OrderTracking.tsx     # Customer order tracking page
    │   │   ├── ProductDetails.tsx    # Product deep dive page (gallery, size/color selectors)
    │   │   └── WomenCollection.tsx   # Women's luxury apparel view
    │   ├── services/
    │   │   └── productService.ts   # Query helper service class for catalog data
    │   └── types/
    │       └── index.ts              # TypeScript interface definitions
    ├── imports/
    │   └── specs.ts                  # Brand specification constants & color tokens
    └── styles/
        ├── fonts.css                 # Custom font definitions
        ├── index.css                 # Main CSS entry point
        ├── tailwind.css              # Tailwind CSS directives
        └── theme.css                 # Custom CSS variables, background forcing, & media queries
```

---

### 5.2 Key Directory Responsibilities & File Breakdown

#### `src/app/App.tsx`
The central routing component. Wraps the app in `CartProvider` and `BrowserRouter`. Defines routes:
- `/` -> `Home`
- `/women` -> `WomenCollection`
- `/men` -> `MenCollection`
- `/islamic` -> `IslamicCollection`
- `/product/:id` -> `ProductDetails`
- `/tracking` -> `OrderTracking`
- `/admin` -> `AdminDashboard`
- Conditional Header/Footer/CartDrawer rendering: Suppresses `Header`, `Footer`, and `CartDrawer` when on `/admin` routes.

#### `src/app/pages/AdminDashboard.tsx`
A 940-line comprehensive admin portal containing:
- Sidebar tabs for switching between **Orders/Statistics** and **Store Management**.
- Order code normalization algorithm (`normalizeOrderCode`) stripping extra symbols/zero-width spaces.
- Real-time order sorting (by date, price, or city proximity).
- Interactive payment review, receipt image lightbox modal, and shipping copy formatter.
- Dynamic product CRUD modal supporting both URL image linking and local file uploads.

#### `src/app/components/CartDrawer.tsx` & `CheckoutForm.tsx`
- Manage drawer open/close animations and keypress event listeners (`Escape`).
- `CheckoutForm` handles 11-digit phone number input sanitization, address details, payment radio selections, and `FileReader` image encoding for receipt uploads.
- Displays a mandatory modal requiring customers to click **"نسخ الكود"** before closing the order completion screen.

#### `src/app/pages/ProductDetails.tsx`
- Dynamic product detail page driven by route params (`useParams<{ id: string }>()`).
- Interactive gallery switching main image upon thumbnail selection.
- Custom state management for selected size and color hex.
- Price calculation with discount comparisons.

#### `src/app/lib/supabase.js`
- Imports `createClient` from `@supabase/supabase-js`.
- Reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Exports a ready `supabase` client instance.

---

## 6. Developer Guide: How to Work on This Project

### 6.1 Architectural & Design System Rules

When extending or modifying the Athar codebase, developers and AI agents must strictly observe the following design and architectural guidelines:

1. **Aesthetic Identity ("Egyptian Heritage Luxury")**:
   - **Primary Palette**: Royal Deep Burgundy (`#4A0E17` / `#5D0F22`), Warm Egyptian Gold (`#D4AF37` / `#c5a065`), and Soft Cream (`#F7E7CC` / `#FCF3E9`).
   - **Background Integrity**: Root HTML and body elements must maintain full-bleed burgundy background (`#4A0E17 !important`) as specified in `theme.css`.
   - **Borders & Radii**: Avoid default 1px solid black borders. Use soft rounded corners (`rounded-full`, `rounded-2xl`, `rounded-[28px]`) with subtle translucent borders (`border-white/10` or `border-[#D4AF37]/20`).
   - **Glassmorphism**: Use backdrop blurs (`backdrop-blur-xl`, `bg-[#14090f]/80`) for modals and sidebars.

2. **Typography Rules**:
   - Primary Arabic Font: `'Noto Serif Arabic'`, `serif` (configured in `tailwind.config.js` as `font-arabic-serif`).
   - Secondary / Labels Font: `'Inter'`, `sans-serif` (configured as `font-label-md`, `font-body-md`).
   - Direction: Default text direction is Right-to-Left (`dir="rtl"`). Ensure icons flipped in RTL inherit Material Symbols scaling rules (`!scale-x-100`).

3. **State & Mutation Guidelines**:
   - Never mutate state directly. Always use context setter methods (`addToCart`, `updateQuantity`, `setOrders`, `setProducts`, `setCategories`).
   - Always validate phone input in forms using 11-digit regex checks.
   - When generating or comparing order codes, always pass values through `normalizeOrderCode()` to prevent formatting mismatches.

---

### 6.2 Setup, Execution & Build Commands

#### Prerequisites
- Node.js version `18.x` or higher
- `pnpm` (recommended) or `npm`

#### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone <repository-url>
cd Athar

# Install dependencies using pnpm
pnpm install

# Alternatively, using npm
npm install
```

#### 2. Configure Environment Variables
Create a `.env` file in the project root (copied from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Run Local Development Server
```bash
# Start Vite development server
pnpm dev

# Or with npm
npm run dev
```
The application will be accessible locally at `http://localhost:5173`.

#### 4. Type Check & Production Build
```bash
# Perform TypeScript validation and create production bundle
pnpm build

# Or with npm
npm run build
```
Output build files will be generated in the `/dist` directory.

#### 5. Preview Production Build Locally
```bash
pnpm preview
```

#### 6. Code Linting
```bash
pnpm lint
```

---

*Documentation maintained by Athar Core Architecture Team.*
