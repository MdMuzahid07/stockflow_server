# StockFlow - Backend API (Smart Inventory & Order Management)

StockFlow is a powerful inventory management backend designed to help businesses track stock, automate replenishment, and manage customer orders with real-time analytics.

## 🚀 Core Features

### 1. **Authentication & RBAC**
- JWT-based login/signup.
- Role-Based Access Control: `admin` and `manager`.
- Protected routes using custom authorization guards.

### 2. **Product & Category Setup**
- Full CRUD for products and categories.
- **Image Support**: Integrated with **Cloudinary** for image storage via **Multer**.
- **Low Stock Threshold**: Manual definition of minimum stock levels per product.

### 3. **Order Management**
- **Transactional Consistency**: Automatic stock deduction during order creation using Mongoose sessions.
- **Stock Restoration**: Auto-refill stock when an order is cancelled.
- **Status Workflow**: `pending` → `confirmed` → `shipped` → `delivered`.
- **Conflict Handling**: Prevents duplicate products in orders or ordering inactive products.

### 4. **Automated Restock Queue**
- **Low Stock Detection**: Automatically adds products to a "Restock Queue" when stock falls below threshold.
- **Priority Rules**: High (0 stock), Medium (<= 50%), Low (> 50%).
- **Manual Replenishment**: Direct fulfillment and removal from queue.

### 5. **Real-time Dashboard & Analytics**
- **Business Insights**: Today's Revenue and Order stats.
- **Status Breakdown**: Visual representation of current order states.
- **Analytics Charts**: Historical revenue and order trends (last 7 days).
- **Recent Activity**: Live system action logs.

## 🛠 Tech Stack
- **Environment**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod
- **Image Hosting**: Cloudinary
- **Auth**: JWT, Bcryptjs

---

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- **Yarn**

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Environment Variables
Create a `.env` file in the root and fill in the values:
```env
DB_URL=
PORT=5000
NODE_ENV=production
DATABASE_NAME=stockflow

# Cloudinary Config
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

# JWT Secrets
JWT_ACCESS_SECRET_KEY=babd1eb4fb9281eee439d727448484a2d9cef78dc59df731cb2449adf694681c
JWT_REFRESH_SECRET_KEY=71a893a7080bce32da0c2ba815ca28801dba37bae6be7a38c9b138f5a21ec771327cf2cbda2b3bcba09738c119ada2ecd869bf457e5432af2d3283e4e29dde84
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUND=12

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
EMAIL_FROM_NAME=stockflow Support

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 3. Available Scripts
- `yarn dev` — Start development server with auto-reload.
- `yarn build` — Build project for production.
- `yarn start` — Run production build.
- `yarn lint` — Run linting check.
- `yarn prettier` — Format entire codebase.

---

## 📖 API Documentation (Brief)

| Endpoint | Method | Description | Role |
|----------|--------|-------------|------|
| `/api/v1/dashboard/stats` | GET | Get real-time stats | Admin/Manager |
| `/api/v1/dashboard/analytics`| GET | Get 7-day sales chart | Admin/Manager |
| `/api/v1/orders` | POST | Create a new order | Manager/Admin |
| `/api/v1/restock/queue` | GET | View pending restocks | Admin/Manager |
| `/api/v1/products` | GET | List all products | Public/Manager |
| `/api/v1/activity-logs` | GET | View system history | Admin |

---
*Created by mdmuzahid.dev@gmail.com*
