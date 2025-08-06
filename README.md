# 📦 Invento-Manage

A modern, full-stack inventory management system built with React, Node.js, Express, and Supabase.

![Invento-Manage](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### 📊 Dashboard
- Real-time inventory statistics
- Low stock alerts
- Out of stock notifications
- Total inventory value tracking
- Recent activity monitoring

### 📦 Product Management
- Complete CRUD operations for products
- SKU and barcode management
- Category and supplier assignment
- Stock level tracking
- Bulk operations support

### 🏷️ Category Management
- Organize products by categories
- Category-based filtering
- Product count per category

### 🏢 Supplier Management
- Comprehensive supplier information
- Contact details and notes
- Products by supplier tracking

### 🔍 Advanced Features
- Real-time search and filtering
- Pagination for large datasets
- Stock movement tracking
- Low stock alerts
- Modern glassmorphism UI design

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Modern styling with glassmorphism effects
- **Supabase Client** - Direct database integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Supabase** - PostgreSQL database and API
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **PostgreSQL** (via Supabase) - Relational database
- **Row Level Security** - Data security
- **UUID** - Unique identifiers
- **Triggers** - Automatic timestamp updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/rudradogra/Invento-Manage.git
cd Invento-Manage
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
# Vite requires VITE_ prefix for environment variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here

# Backend API URL
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Database Setup (Already Done ✅)
Since you already have the tables set up in Supabase, you're good to go! The schema is documented in `backend/database/schema.sql` for reference.

### 5. Start the Applications

Start the backend server:
```bash
cd backend
npm start
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application!

## 📁 Project Structure

```
Invento-Manage/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Layout.jsx   # Main layout component
│   │   │   └── Layout.css   # Layout styles
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx # Dashboard page
│   │   │   ├── Inventory.jsx # Inventory management
│   │   │   └── *.css        # Page-specific styles
│   │   ├── lib/             # Utility libraries
│   │   │   └── supabase.js  # Supabase client config
│   │   ├── App.jsx          # Main app component
│   │   ├── App.css          # Global styles
│   │   ├── index.css        # Base styles
│   │   └── main.jsx         # App entry point
│   ├── .env                 # Environment variables
│   ├── package.json         # Dependencies
│   └── vite.config.js       # Vite configuration
│
├── backend/                  # Node.js backend API
│   ├── routes/              # API route handlers
│   │   ├── products.js      # Product CRUD operations
│   │   ├── categories.js    # Category management
│   │   ├── suppliers.js     # Supplier management
│   │   └── dashboard.js     # Analytics endpoints
│   ├── middleware/          # Custom middleware
│   │   └── supabase.js      # Supabase middleware
│   ├── database/            # Database documentation
│   │   └── schema.sql       # Database schema reference
│   ├── .env                 # Environment variables
│   ├── index.js             # Server entry point
│   ├── package.json         # Dependencies
│   └── API_DOCS.md          # API documentation
│
└── README.md                # Project documentation
```

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Check API and database connectivity

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/alerts` - Get stock alerts

### Products
- `GET /api/products` - Get all products (with pagination, search)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock quantity

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier

For detailed API documentation, see [API_DOCS.md](backend/API_DOCS.md)

## 🎨 UI Features

### Modern Design
- **Glassmorphism Effects** - Beautiful frosted glass design
- **Gradient Backgrounds** - Stunning purple-blue gradients
- **Smooth Animations** - Hover effects and transitions
- **Responsive Design** - Mobile-friendly layouts
- **Professional Typography** - Modern font choices

### Interactive Elements
- **Real-time Search** - Instant product filtering
- **Status Badges** - Color-coded stock levels
- **Action Buttons** - Intuitive CRUD operations
- **Navigation** - Smooth page transitions

## 🔒 Database Schema Reference

The database consists of four main tables:

### Products
- Product information (name, SKU, price, quantity)
- Category and supplier relationships
- Stock level tracking

### Categories
- Product categorization
- Description and metadata

### Suppliers
- Supplier contact information
- Address and communication details

### Stock Movements
- Inventory tracking history
- Movement types (IN, OUT, ADJUSTMENT)

*Note: The complete schema is documented in `backend/database/schema.sql` for reference, even though your tables are already set up in Supabase.*

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:3000
```

## 🚀 Deployment

### Backend Deployment
1. Deploy to services like Heroku, Railway, or Vercel
2. Set environment variables in your hosting platform
3. Update CORS configuration for production

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update `VITE_BACKEND_URL` to point to your deployed backend

### Database
Your Supabase database is already cloud-hosted and ready for production!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend as a Service
- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Express.js](https://expressjs.com/) - Backend framework

## 📞 Support

If you have any questions or need help, please:
1. Check the [API Documentation](backend/API_DOCS.md)
2. Open an issue on GitHub
3. Contact the maintainer

---

**Built with ❤️ by [Rudra Pratap Dogra](https://github.com/rudradogra)**
