# FreshMart — General Store Management System

A full-stack MERN application for a local grocery/general store: a customer-facing storefront (browse, cart, checkout, order tracking) and an admin panel (products, categories, inventory, orders, customers, dashboard, settings).

**Stack:** React (Vite) + Tailwind CSS + Redux Toolkit · Node.js + Express · MongoDB + Mongoose · JWT auth

---

## 1. What's included

- **Auth:** register, login, JWT, role-based access (admin/customer), protected routes, auto-login via `/api/auth/me`, session persistence in `localStorage`.
- **Admin panel:** dashboard with live stats + monthly sales chart, category CRUD, product CRUD with search/filter/pagination, inventory (stock in/out, low-stock alerts), order management with a guarded status workflow, customer management (activate/deactivate), store settings.
- **Customer portal:** browse/search/filter products, product detail, cart (qty +/-, remove), checkout with saved/new addresses, order placement, order tracking with a visual status stepper, profile + address book.
- **Orders:** placing an order validates stock, decrements it, and is immediately visible to the admin; status changes follow an explicit allowed-transition map (e.g. `pending → accepted → packing → dispatched → delivered`), and rejecting/cancelling automatically restocks items.
- **SPA refresh fix:** deployment configs so refreshing any deep route (`/dashboard`, `/products`, `/orders`, etc.) never 404s — see [section 6](#6-deployment-the-never-404-on-refresh-setup).

### Deliberately deferred (noted so nothing is a surprise)

These were in the original spec but are **not** implemented in this pass, to keep what *is* built solid rather than spreading effort thin:

| Feature | Status |
|---|---|
| Socket.IO real-time notifications | Not implemented — orders currently update via normal REST + refetch, not live push |
| Cloudinary / file uploads (Multer) | Not implemented — products/categories use plain image URLs instead |
| Swagger API docs | Not implemented — see the [API reference](#5-api-reference) below instead |
| Coupons, Wishlist | Models/UI not implemented |
| PDF/Excel report export | Not implemented |
| Dark mode | Not implemented |

All of these can be layered on top of the current architecture without restructuring it.

---

## 2. Project structure

```
store-management/
├── server/                  # Express API
│   ├── config/db.js
│   ├── models/               # User, Category, Product, Cart, Order, Settings
│   ├── controllers/
│   ├── routes/
│   ├── middleware/           # auth (JWT + role guard), errorHandler, validate
│   ├── utils/generateToken.js
│   ├── seed/seed.js           # admin + sample customer + categories + products
│   └── server.js
├── client/                  # React (Vite) app
│   └── src/
│       ├── pages/customer/   # Home, ProductList, ProductDetail, Cart, Checkout, Login, Register, Profile, Orders
│       ├── pages/admin/      # Dashboard, Products, ProductForm, Categories, Orders, Inventory, Customers, Settings
│       ├── layouts/          # CustomerLayout, AdminLayout
│       ├── routes/           # ProtectedRoute, AdminRoute
│       ├── redux/            # store, authSlice, cartSlice
│       ├── components/       # Navbar, Sidebar, ProductCard, Pagination, Loader
│       └── services/api.js   # Axios instance with JWT interceptor
├── nginx.conf
├── render.yaml
├── railway.json
└── package.json              # root convenience scripts
```

---

## 3. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod` or MongoDB Atlas)

### Steps

```bash
# from the project root
npm run install:all          # installs both server and client dependencies

# configure environment variables
cp server/.env.example server/.env      # then fill in MONGO_URI, JWT_SECRET, etc.
cp client/.env.example client/.env      # defaults to http://localhost:5005/api

# seed an admin account, a sample customer, and demo products
npm run seed

# run both apps together
npm run dev
```

- API: `http://localhost:5005/api`
- Frontend: `http://localhost:5173`

### Demo credentials (created by the seed script)
| Role | Email | Password |
|---|---|---|
| Admin | `admin@store.com` | `Admin@123` |
| Customer | `customer@store.com` | `Customer@123` |

(Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` before seeding if you want different admin credentials.)

---

## 4. Environment variables

**`server/.env`**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/store-management
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@store.com
ADMIN_PASSWORD=Admin@123
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5005/api
```

---

## 5. API reference

Base URL: `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a customer |
| POST | `/login` | Public | Login (admin or customer) |
| GET | `/me` | Private | Current user profile (auto-login) |
| PUT | `/profile` | Private | Update name/phone/password |
| POST | `/addresses` | Private | Add address |
| PUT | `/addresses/:addressId` | Private | Update address |
| DELETE | `/addresses/:addressId` | Private | Delete address |

### Categories — `/categories`
| Method | Route | Access |
|---|---|---|
| GET | `/?search=` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Products — `/products`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/?search=&category=&brand=&minPrice=&maxPrice=&status=&featured=&stockStatus=&page=&limit=&sort=` | Public | Paginated, filterable |
| GET | `/:id` | Public | |
| POST | `/` | Admin | |
| PUT | `/:id` | Admin | |
| DELETE | `/:id` | Admin | |
| PATCH | `/:id/stock` | Admin | Body: `{ type: "in"\|"out", quantity }` |
| GET | `/alerts/low-stock` | Admin | |

### Cart — `/cart` (Customer only)
| Method | Route |
|---|---|
| GET | `/` |
| POST | `/` — body `{ productId, quantity }` |
| PUT | `/:productId` — body `{ quantity }` |
| DELETE | `/:productId` |
| DELETE | `/` — clear cart |

### Orders — `/orders`
| Method | Route | Access |
|---|---|---|
| POST | `/` | Customer — places order from cart, body `{ shippingAddress, paymentMethod }` |
| GET | `/my` | Customer — order history |
| GET | `/:id` | Owner or admin |
| GET | `/?status=&search=&page=&limit=` | Admin |
| PATCH | `/:id/status` | Admin — body `{ status, note }`, enforces allowed transitions |

### Admin — `/admin`
| Method | Route |
|---|---|
| GET | `/dashboard` |
| GET | `/customers?search=&page=&limit=` |
| PATCH | `/customers/:id/status` |

### Settings — `/settings`
| Method | Route | Access |
|---|---|---|
| GET | `/` | Public |
| PUT | `/` | Admin |

---

## 6. Deployment (the "never 404 on refresh" setup)

The root cause of refresh-404s is that React Router handles routes like `/dashboard` entirely client-side — the server never actually has a `/dashboard` file to serve, so a hard refresh (which hits the server directly) 404s unless the server is told to fall back to `index.html`. Every config below does exactly that.

### Frontend on Vercel
`client/vercel.json` is already included:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Set the project root to `client/`, build command `npm run build`, output directory `dist`. Add `VITE_API_URL` pointing at your deployed backend.

### Frontend on Netlify
`client/netlify.toml` and `client/public/_redirects` are both included (belt-and-suspenders — either one alone is sufficient). Set base directory to `client`, build command `npm run build`, publish directory `dist`.

### Backend on Render
`render.yaml` at the project root defines the service (root dir `server`, `npm install` / `npm start`). Set `MONGO_URI`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` as environment variables in the Render dashboard (marked `sync: false` in the config so they aren't committed).

### Backend on Railway
`railway.json` at the project root does the equivalent for Railway.

### Self-hosted with Nginx
`nginx.conf` serves the built React app and proxies `/api/*` to the Node process, with a SPA fallback (`try_files $uri $uri/ /index.html;`) so refreshing any route works. Instructions are commented at the top of the file.

### Combined single-server deployment
`server/server.js` also supports serving the React build directly when `NODE_ENV=production`: it serves `client/dist` as static files and has an Express catch-all (`app.get("*", ...)`) that returns `index.html` for any non-`/api` route. Useful if you want one process/host instead of separate frontend and backend deployments.

---

## 7. Notes on the order status workflow

Orders move through a fixed set of allowed transitions (enforced server-side in `orderController.js`):

```
pending → accepted → packing → dispatched → delivered
   ↓          ↓          ↓
rejected  cancelled  cancelled
```

Rejecting or cancelling an order automatically restocks its items. The admin UI in `pages/admin/Orders.jsx` only ever shows the buttons for valid next steps, and the API rejects any other transition with a 400.
