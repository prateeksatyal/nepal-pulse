import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// User Pages
import DashboardPage from './pages/user/DashboardPage';
import ProductsPage from './pages/user/ProductsPage';
import ProductFormPage from './pages/user/ProductFormPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import WarrantiesPage from './pages/user/WarrantiesPage';
import WarrantyFormPage from './pages/user/WarrantyFormPage';
import WarrantyDetailPage from './pages/user/WarrantyDetailPage';
import ServiceRecordsPage from './pages/user/ServiceRecordsPage';
import ServiceFormPage from './pages/user/ServiceFormPage';
import DocumentsPage from './pages/user/DocumentsPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminWarrantiesPage from './pages/admin/AdminWarrantiesPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';

// Route Guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner label="Authenticating session..." className="min-h-screen" />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return <LoadingSpinner label="Verifying administrator rights..." className="min-h-screen" />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated User Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Product CRUD (Feature 1) */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />

        {/* Warranty CRUD (Feature 2 & 4) */}
        <Route path="warranties" element={<WarrantiesPage />} />
        <Route path="warranties/new" element={<WarrantyFormPage />} />
        <Route path="warranties/:id" element={<WarrantyDetailPage />} />
        <Route path="warranties/:id/edit" element={<WarrantyFormPage />} />

        {/* Service/Repair CRUD (Feature 3) */}
        <Route path="services" element={<ServiceRecordsPage />} />
        <Route path="services/new" element={<ServiceFormPage />} />
        <Route path="services/:id/edit" element={<ServiceFormPage />} />

        {/* Documents & Receipts (Feature 7 & 8) */}
        <Route path="documents" element={<DocumentsPage />} />

        {/* User Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="warranties" element={<AdminWarrantiesPage />} />
        <Route path="services" element={<AdminServicesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
