import React, { useState } from 'react';
import './Inventory.css';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - replace with real data from Supabase
  const [products] = useState([
    { id: 1, name: 'Laptop Dell XPS 13', sku: 'DELL-XPS-001', quantity: 25, price: 1299.99, category: 'Electronics' },
    { id: 2, name: 'Office Chair', sku: 'CHAIR-001', quantity: 50, price: 299.99, category: 'Furniture' },
    { id: 3, name: 'Wireless Mouse', sku: 'MOUSE-001', quantity: 100, price: 49.99, category: 'Electronics' },
    { id: 4, name: 'Standing Desk', sku: 'DESK-001', quantity: 15, price: 599.99, category: 'Furniture' },
    { id: 5, name: 'Monitor 27"', sku: 'MON-001', quantity: 30, price: 349.99, category: 'Electronics' },
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 20) return 'low-stock';
    return 'in-stock';
  };

  const getStockLabel = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 20) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1>Inventory</h1>
        <div className="inventory-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary">
            ➕ Add Product
          </button>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="product-name">{product.name}</td>
                <td className="product-sku">{product.sku}</td>
                <td>{product.category}</td>
                <td className="quantity">{product.quantity}</td>
                <td className="price">${product.price}</td>
                <td>
                  <span className={`status ${getStockStatus(product.quantity)}`}>
                    {getStockLabel(product.quantity)}
                  </span>
                </td>
                <td className="actions">
                  <button className="action-btn edit">✏️</button>
                  <button className="action-btn delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
