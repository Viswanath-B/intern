# Internship Application Web App

A full-stack internship portal built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and Multer.

## What it includes

- Landing page with a premium, responsive UI
- Separate application routes for short-term and long-term internships
- Validation on both client and server
- QR-based UPI payment flow with alternate app options
- Receipt upload with image/PDF preview before submission
- MongoDB persistence for submitted applications
- Optional confirmation email for applicants when SMTP settings are configured

## Project Structure

- `client/` - React frontend
- `server/` - Express API and MongoDB models
- `server/models/` - Mongoose schemas
- `server/routes/` - API routes
- `server/controllers/` - request handlers
- `server/uploads/` - locally stored payment receipts

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

### 1) Configure environment variables

Copy the example files and update the values:

- `server/.env.example` -> `server/.env`
- `client/.env.example` -> `client/.env`

### 2) Install dependencies

From the `server` folder:

```bash
npm install
```

From the `client` folder:

```bash
npm install
```

### 3) Start the backend

```bash
npm run dev
```

Run this inside `server/`.

### 4) Start the frontend

```bash
npm run dev
```

Run this inside `client/`.

## Production Mode

To build the client and start the API in production mode from the project root:

```bash
npm run prod
```

This will:

- build the React app into `client/dist`
- start the Express server with `NODE_ENV=production`
- serve the built client from Express for normal browser routes

## API Endpoints

- `POST /api/apply` - save a new internship application
- `GET /api/applications` - fetch paginated applications from MongoDB (supports `page`, `limit`, `search`, `internshipType`, `role`; requires `x-admin-token` or `Authorization: Bearer <token>`)
- `GET /api/applications/export` - export filtered application data as CSV (requires `x-admin-token` or `Authorization: Bearer <token>`)
- `GET /api/health` - health check

## Environment Variables

### server/.env

- `PORT` - API port
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_ORIGIN` - allowed frontend origin
- `PUBLIC_BASE_URL` - public server base URL used for uploaded file links
- `COMPANY_NAME` - company branding used in payment labels
- `UPI_ID` - UPI ID used in the payment deep link
- `SHORT_TERM_FEE` - fee for the 2 month internship
- `LONG_TERM_FEE` - fee for the 4 month internship
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` - optional email delivery settings
- `ADMIN_DASHBOARD_TOKEN` - required token to access protected admin endpoints (`/api/applications`, `/api/applications/export`, `/api/test-email`)

### client/.env

- `VITE_API_BASE_URL` - backend API base URL
- `VITE_COMPANY_NAME` - company branding shown in the UI
- `VITE_UPI_ID` - UPI ID used to build the payment deep link
- `VITE_SHORT_TERM_FEE` - frontend display fee for the short-term route
- `VITE_LONG_TERM_FEE` - frontend display fee for the long-term route

## Notes

- Receipt files are stored locally in `server/uploads/`.
- The payment QR code is generated from a UPI deep link, so no separate static QR asset is required.
