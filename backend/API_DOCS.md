# Invento-Manage API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Health Check
- **GET** `/health` - Check API and database connectivity

### Dashboard Analytics
- **GET** `/dashboard/stats` - Get dashboard statistics
- **GET** `/dashboard/recent-activity` - Get recent product updates
- **GET** `/dashboard/top-products` - Get top products by value
- **GET** `/dashboard/category-distribution` - Get product distribution by category
- **GET** `/dashboard/alerts` - Get stock alerts (low stock, out of stock)

### Products
- **GET** `/products` - Get all products (with pagination, search, filters)
- **GET** `/products/:id` - Get single product
- **POST** `/products` - Create new product
- **PUT** `/products/:id` - Update product
- **DELETE** `/products/:id` - Delete product
- **GET** `/products/alerts/low-stock` - Get low stock products
- **PATCH** `/products/:id/stock` - Update stock quantity

### Categories
- **GET** `/categories` - Get all categories
- **GET** `/categories/:id` - Get single category
- **POST** `/categories` - Create new category
- **PUT** `/categories/:id` - Update category
- **DELETE** `/categories/:id` - Delete category
- **GET** `/categories/:id/products` - Get products in category

### Suppliers
- **GET** `/suppliers` - Get all suppliers (with pagination, search)
- **GET** `/suppliers/:id` - Get single supplier
- **POST** `/suppliers` - Create new supplier
- **PUT** `/suppliers/:id` - Update supplier
- **DELETE** `/suppliers/:id` - Delete supplier
- **GET** `/suppliers/:id/products` - Get products from supplier

## Request/Response Examples

### Get Dashboard Stats
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 156,
    "lowStock": 12,
    "outOfStock": 3,
    "totalValue": 45280.50,
    "totalCategories": 8,
    "totalSuppliers": 15
  }
}
```

### Get Products (with pagination and search)
```http
GET /api/products?page=1&limit=10&search=laptop&category=Electronics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS-001",
      "description": "High-performance ultrabook",
      "category": "Electronics",
      "price": 1299.99,
      "cost": 999.99,
      "quantity": 25,
      "min_stock_level": 5,
      "supplier_id": "456e7890-e89b-12d3-a456-426614174001",
      "barcode": null,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "New Product",
  "sku": "PROD-001",
  "description": "Product description",
  "category": "Electronics",
  "price": 99.99,
  "cost": 59.99,
  "quantity": 50,
  "min_stock_level": 10,
  "supplier_id": "456e7890-e89b-12d3-a456-426614174001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "name": "New Product",
    "sku": "PROD-001",
    // ... other fields
  }
}
```

### Update Stock
```http
PATCH /api/products/123e4567-e89b-12d3-a456-426614174000/stock
Content-Type: application/json

{
  "quantity": 10,
  "operation": "add"  // "add", "subtract", or "set"
}
```

### Get Stock Alerts
```http
GET /api/dashboard/alerts
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lowStock": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Product Name",
        "sku": "PROD-001",
        "quantity": 3,
        "min_stock_level": 10
      }
    ],
    "outOfStock": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Out of Stock Product",
        "sku": "PROD-002",
        "quantity": 0
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Query Parameters

### Products Endpoint
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in name and SKU
- `category` (string): Filter by category

### Suppliers Endpoint
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in name and email

## Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `sku` (VARCHAR, Required, Unique)
- `description` (TEXT)
- `category` (VARCHAR, Foreign Key to categories.name)
- `price` (DECIMAL, Required)
- `cost` (DECIMAL)
- `quantity` (INTEGER, Required, Default: 0)
- `min_stock_level` (INTEGER, Default: 10)
- `supplier_id` (UUID, Foreign Key to suppliers.id)
- `barcode` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Categories Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required, Unique)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Suppliers Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Required)
- `contact_person` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `country` (VARCHAR)
- `postal_code` (VARCHAR)
- `website` (VARCHAR)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Stock Movements Table
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key to products.id)
- `movement_type` (VARCHAR: 'IN', 'OUT', 'ADJUSTMENT')
- `quantity` (INTEGER)
- `reference` (VARCHAR)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `created_by` (VARCHAR)
