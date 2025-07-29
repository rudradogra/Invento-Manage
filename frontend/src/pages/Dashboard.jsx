import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Test connection first
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        setError('Unable to connect to database. Please check your Supabase setup.');
      } else {
        // If connection works, you can fetch real data here
        // For now, setting mock data
        setStats({
          totalProducts: 156,
          lowStock: 12,
          outOfStock: 3,
          totalValue: 45280
        });
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your inventory management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Low Stock</h3>
            <p className="stat-number">{stats.lowStock}</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <h3>Out of Stock</h3>
            <p className="stat-number">{stats.outOfStock}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Value</h3>
            <p className="stat-number">${stats.totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">
            ➕ Add New Product
          </button>
          <button className="action-btn">
            📊 View Reports
          </button>
          <button className="action-btn">
            🔍 Search Inventory
          </button>
          <button className="action-btn">
            📈 Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
