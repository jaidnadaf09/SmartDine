# SmartDine

A premium restaurant management and table booking application.

## Features
- **Table Booking with Payment**: Users can book tables by paying a minimum amount via Razorpay.
- **Admin Dashboard**: Manage orders, inventory, and bookings.
- **Responsive Design**: Modern UI/UX built with React and Vite.

## Tech Stack
- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express, Sequelize (PostgreSQL)
- **Payment Gateway**: Razorpay

## Deployment on Render

### 1. Backend Setup
Ensure the following environment variables are set in your Render dashboard for the backend service:
- `RAZORPAY_KEY_ID`: Your Razorpay Test/Live Key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay Test/Live Key Secret
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Your secret for authentication
- `NODE_ENV`: production

### 2. Frontend Setup
Ensure the following environment variables are set in your Netlify or Render dashboard for the frontend:
- `VITE_API_URL`: `https://smartdine-l22i.onrender.com/api`
- `VITE_RAZORPAY_KEY_ID`: Your Razorpay Test/Live Key ID

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install` (root and backend).
3. Set up `.env` files based on the structure provided.
4. Run: `npm run dev`.
