import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import Home from './pages/Home';
import { WomenCollection } from './pages/WomenCollection';
import { MenCollection } from './pages/MenCollection';
import { IslamicCollection } from './pages/IslamicCollection';
import { ProductDetails } from './pages/ProductDetails';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent selection:bg-brand-burgundy selection:text-white">
      {!isAdminRoute && <Header />}
      <div className={`flex-1 ${isAdminRoute ? '' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/women" element={<WomenCollection />} />
          <Route path="/men" element={<MenCollection />} />
          <Route path="/islamic" element={<IslamicCollection />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <Footer />}
      <AuthModal />
      <UserProfileModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
