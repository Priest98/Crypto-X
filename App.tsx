
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MidlProvider } from '@midl/react';
import { midlConfig } from './lib/midlConfig';
import { StoreProvider } from './context/StoreContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Whitepaper from './pages/Whitepaper';
import Wallet from './pages/Wallet';
import Receive from './pages/Receive';

const App: React.FC = () => {
  return (
    <MidlProvider config={midlConfig}>
      <Router>
        <ScrollToTop />
        <StoreProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/whitepaper" element={<Whitepaper />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/receive" element={<Receive />} />
            </Routes>
          </Layout>
        </StoreProvider>
      </Router>
    </MidlProvider>
  );
};

export default App;
