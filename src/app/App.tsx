import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { WomenCollection } from './pages/WomenCollection';
import { MenCollection } from './pages/MenCollection';
import { IslamicCollection } from './pages/IslamicCollection';
import { ProductDetails } from './pages/ProductDetails';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface selection:bg-brand-burgundy selection:text-white">
      {!isHomePage && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/women" element={<WomenCollection />} />
          <Route path="/women.html" element={<WomenCollection />} />
          <Route path="/men" element={<MenCollection />} />
          <Route path="/men.html" element={<MenCollection />} />
          <Route path="/islamic" element={<IslamicCollection />} />
          <Route path="/islamic.html" element={<IslamicCollection />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/product-details.html" element={<ProductDetails />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <CartDrawer />
      {!isHomePage && <Footer />}
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
