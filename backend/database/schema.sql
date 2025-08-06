-- Invento-Manage Database Schema
-- 
-- ⚠️  IMPORTANT NOTE: 
-- This file serves as DOCUMENTATION for the existing database structure.
-- The tables are already created in your Supabase database.
-- 
-- This file is useful for:
-- - Understanding the database structure
-- - Setting up development/staging environments
-- - Version control of schema changes
-- - Team collaboration and onboarding
-- 
-- If you need to recreate the database structure, run this SQL in your Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  website VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(255) REFERENCES categories(name) ON UPDATE CASCADE,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2) CHECK (cost >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock_level INTEGER DEFAULT 10 CHECK (min_stock_level >= 0),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  barcode VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements Table (for tracking inventory changes)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity INTEGER NOT NULL,
  reference VARCHAR(255), -- Reference to purchase order, sale, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- Could be user ID in the future
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(quantity, min_stock_level);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for stock management
CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, amount INTEGER)
RETURNS products AS $$
DECLARE
    result products;
BEGIN
    UPDATE products 
    SET quantity = quantity + amount, updated_at = NOW()
    WHERE id = product_id
    RETURNING * INTO result;
    
    -- Record stock movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, notes)
    VALUES (product_id, 'IN', amount, 'Stock increment via API');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, amount INTEGER)
RETURNS products AS $$
DECLARE
    result products;
    current_quantity INTEGER;
BEGIN
    -- Check current quantity
    SELECT quantity INTO current_quantity FROM products WHERE id = product_id;
    
    IF current_quantity < amount THEN
        RAISE EXCEPTION 'Insufficient stock. Current quantity: %, Requested: %', current_quantity, amount;
    END IF;
    
    UPDATE products 
    SET quantity = quantity - amount, updated_at = NOW()
    WHERE id = product_id
    RETURNING * INTO result;
    
    -- Record stock movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, notes)
    VALUES (product_id, 'OUT', amount, 'Stock decrement via API');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Furniture', 'Office and home furniture'),
('Stationery', 'Office supplies and stationery items'),
('Books', 'Books and educational materials'),
('Clothing', 'Apparel and accessories')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, city, country) VALUES
('Tech Supplies Co.', 'John Smith', 'john@techsupplies.com', '+1-555-0123', 'San Francisco', 'USA'),
('Furniture Plus', 'Sarah Johnson', 'sarah@furnitureplus.com', '+1-555-0124', 'Chicago', 'USA'),
('Office Essentials', 'Mike Brown', 'mike@officeessentials.com', '+1-555-0125', 'New York', 'USA')
ON CONFLICT DO NOTHING;

-- Insert some sample products
INSERT INTO products (name, sku, description, category, price, cost, quantity, min_stock_level) VALUES
('Laptop Dell XPS 13', 'DELL-XPS-001', 'High-performance ultrabook', 'Electronics', 1299.99, 999.99, 25, 5),
('Office Chair Ergonomic', 'CHAIR-ERG-001', 'Comfortable ergonomic office chair', 'Furniture', 299.99, 199.99, 50, 10),
('Wireless Mouse Logitech', 'MOUSE-LOG-001', 'Wireless optical mouse', 'Electronics', 49.99, 29.99, 100, 20),
('Standing Desk Adjustable', 'DESK-ADJ-001', 'Height adjustable standing desk', 'Furniture', 599.99, 399.99, 15, 5),
('Monitor 27" 4K', 'MON-4K-001', '27-inch 4K display monitor', 'Electronics', 349.99, 249.99, 30, 8)
ON CONFLICT (sku) DO NOTHING;

-- Set up Row Level Security (RLS) - Optional
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust according to your security needs)
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON suppliers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON stock_movements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON stock_movements FOR DELETE USING (true);
