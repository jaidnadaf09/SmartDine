-- Supabase SmartDine Production DB Sync Script
-- Safely creates tables, columns, enums, and seeds without dropping existing data.

-- 1. Create Safe ENUMS 
DO $$ BEGIN
    CREATE TYPE enum_users_role AS ENUM('customer', 'admin', 'chef', 'CHEF', 'WAITER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_users_shift AS ENUM('Morning', 'Evening');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_users_status AS ENUM('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_tables_status AS ENUM('available', 'occupied', 'reserved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_bookings_status AS ENUM('pending', 'confirmed', 'checked_in', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_bookings_paymentStatus AS ENUM('pending', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_orders_status AS ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_orders_paymentStatus AS ENUM('pending', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE enum_orders_orderType AS ENUM('DINE_IN', 'TAKEAWAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. CREATE CRITICAL TABLES (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255),
    password VARCHAR(255),
    role enum_users_role DEFAULT 'customer',
    shift enum_users_shift,
    status enum_users_status DEFAULT 'active',
    "walletBalance" DECIMAL(10,2) DEFAULT 0.00,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    "tableNumber" INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status enum_tables_status DEFAULT 'available',
    orders INTEGER DEFAULT 0,
    "customerId" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    "customerName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(255) NOT NULL,
    guests INTEGER NOT NULL,
    "tableNumber" INTEGER,
    "tableId" INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    status enum_bookings_status DEFAULT 'pending',
    "specialRequests" TEXT,
    occasion VARCHAR(255),
    preference VARCHAR(255),
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL,
    "paymentId" VARCHAR(255),
    "paymentStatus" enum_bookings_paymentStatus DEFAULT 'pending',
    "cancelReason" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "bookingId" INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    items JSONB,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status enum_orders_status DEFAULT 'pending',
    "paymentId" VARCHAR(255),
    "paymentStatus" enum_orders_paymentStatus DEFAULT 'pending',
    "tableNumber" INTEGER,
    "orderType" enum_orders_orderType DEFAULT 'TAKEAWAY',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "orderId" INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    "menuItemId" INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 3. ALTER EXISTING TABLES TO SYNCHRONIZE NEW COLUMNS
-- By safely enforcing ADD COLUMN IF NOT EXISTS, we patch up legacy deployments.

ALTER TABLE users ADD COLUMN IF NOT EXISTS "walletBalance" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileImage" TEXT;

ALTER TABLE tables ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 4;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS status enum_tables_status DEFAULT 'available';
ALTER TABLE tables ADD COLUMN IF NOT EXISTS orders INTEGER DEFAULT 0;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "tableNumber" INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preference VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS occasion VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "specialRequests" TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount DECIMAL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "cancelReason" VARCHAR(255);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS "tableNumber" INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderType" enum_orders_orderType DEFAULT 'TAKEAWAY';


-- 4. INSERT BACKBONE RESTAURANT SEED DATA
-- Fills tables only if they don't natively exist yet.

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 1, 2, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 1);

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 2, 2, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 2);

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 3, 4, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 3);

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 4, 4, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 4);

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 5, 6, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 5);

INSERT INTO tables ("tableNumber", capacity, status, "createdAt", "updatedAt")
SELECT 6, 8, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE "tableNumber" = 6);
