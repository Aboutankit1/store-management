import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Home from "./pages/customer/Home";
import ProductList from "./pages/customer/ProductList";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import Profile from "./pages/customer/Profile";
import Orders from "./pages/customer/Orders";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import Inventory from "./pages/admin/Inventory";
import Customers from "./pages/admin/Customers";
import Settings from "./pages/admin/Settings";

import { fetchMe } from "./redux/slices/authSlice";
import { fetchCart } from "./redux/slices/cartSlice";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Auto-login / session persistence: re-validate token & refresh profile on load
  useEffect(() => {
    if (user) {
      dispatch(fetchMe());
      if (user.role === "customer") dispatch(fetchCart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
      <Routes>
        {/* Customer-facing storefront */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<Orders />} />
          </Route>
        </Route>

        {/* Admin panel */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch-all: any unknown app route (not a refresh - Express handles those) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
