import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import Home from './pages/Home.tsx';
import { WomenCollection } from './pages/WomenCollection';
import { MenCollection } from './pages/MenCollection';
import { IslamicCollection } from './pages/IslamicCollection';
import { ProductDetails } from './pages/ProductDetails';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
