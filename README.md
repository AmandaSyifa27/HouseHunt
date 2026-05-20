# HouseHunt

A full-stack real estate web application that connects property owners (landlords) with people looking to rent or buy a home (tenants). Built as a capstone project using the MERN stack.

---

## What is this?

HouseHunt is a centralized property marketplace where landlords can list their properties and tenants can search, save, and book them — all in one place. No more chasing brokers or scrolling through scattered social media posts.

The app has three distinct user roles, each with their own dashboard and features:

- **Tenant** — Browse properties, save favorites, book with a down payment, and track booking status
- **Landlord** — List and manage properties, confirm tenant bookings, manage billing and subscription
- **Admin** — Oversee the entire platform: verify payments, moderate listings, manage users, and handle reports

---

## Tech Stack

**Frontend**

- React + Vite
- Tailwind CSS v4
- React Router DOM
- Axios
- Lucide React (icons)

**Backend**

- Node.js + Express
- MongoDB + Mongoose (MongoDB Atlas)
- JWT Authentication
- bcryptjs
- Multer + Cloudinary (image uploads)

---

## Features

### Public (no login required)

- Browse and search properties with filters (city, type, price range, bedrooms, area)
- City autocomplete in search bar
- View property details with photo gallery, amenities, and Google Maps link
- View landlord profiles and their listings
- Recommended properties section on homepage

### Tenant

- Save properties to favorites (wishlist)
- Book a property with a 10% down payment — upload transfer receipt
- Track booking status (pending → confirmed/rejected)
- Report a booked property to admin (fraud, scam, etc.)
- Edit profile and change password

### Landlord

- Post properties (first listing free, subsequent listings require a $5 fee or Premium subscription)
- Premium plan ($29/month) — unlimited listings + 3 "Recommended" pins
- Manage own listings — edit, delete, toggle recommended
- Review and confirm/reject incoming booking requests from tenants
- View billing history and submit payment receipts for admin verification
- Edit profile and change password

### Admin

- Dashboard with platform stats (users, listings, pending transactions)
- Verify landlord payments (listing fee + premium subscription)
- Moderate property listings — hide or delete flagged content
- Manage users — ban/unban landlords and tenants
- Review tenant reports — hide property, ban landlord, or dismiss
- Account settings (profile + password)

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/AmandaSyifa27/HouseHunt
cd househunt
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Seed the database with sample data:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and you're good to go.

---

## Seed Accounts

After running `npm run seed`, these accounts are available:

| Role     | Email                | Password  |
| -------- | -------------------- | --------- |
| Admin    | admin@househunt.com  | Admin123! |
| Landlord | james@househunt.com  | Test1234! |
| Landlord | sarah@househunt.com  | Test1234! |
| Tenant   | amanda@househunt.com | Test1234! |
| Tenant   | budi@househunt.com   | Test1234! |

> James is on the **Premium plan**. Sarah is on the **Free plan** with her free post already used.

---

## Project Structure

```
househunt/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Shared UI components
│       ├── contexts/        # Auth context
│       ├── hooks/           # Custom hooks (useToast, useAuth)
│       ├── pages/
│       │   ├── admin/       # Admin dashboard pages
│       │   ├── landlord/    # Landlord dashboard pages
│       │   ├── public/      # Public-facing pages
│       │   └── tenant/      # Tenant-only pages
│       └── utils/           # Axios instance, helpers
│
└── server/                  # Express backend
    ├── config/              # DB + Cloudinary setup
    ├── controllers/         # Route handlers
    ├── middleware/           # Auth guard, file upload
    ├── models/              # Mongoose schemas
    ├── routes/              # API routes
    └── scripts/             # Seed script
```

---

## API Overview

| Method | Endpoint                                | Description                       |
| ------ | --------------------------------------- | --------------------------------- |
| POST   | `/api/auth/register`                    | Register as tenant or landlord    |
| POST   | `/api/auth/login`                       | Login                             |
| GET    | `/api/properties`                       | Get all properties (with filters) |
| GET    | `/api/properties/:id`                   | Property detail                   |
| POST   | `/api/properties`                       | Create property (landlord)        |
| GET    | `/api/favorites`                        | Get tenant favorites              |
| POST   | `/api/transactions/booking/:propertyId` | Book a property (tenant)          |
| PUT    | `/api/transactions/landlord/orders/:id` | Confirm/reject booking (landlord) |
| PUT    | `/api/admin/transactions/:id`           | Approve/reject payment (admin)    |
| POST   | `/api/reports/:propertyId`              | Report a property (tenant)        |

Full API documentation available in the codebase.

---

## License

This project was built as Last Mile 2026 capstone project.
