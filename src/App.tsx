import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExchangeHeader } from './components/ExchangeHeader';
import { ExchangeForm } from './components/ExchangeForm';
import { MarketStats } from './components/MarketStats';
import { ReservesList } from './components/ReservesList';
import { FAQ } from './pages/FAQ';
import { Support } from './pages/Support';
import { OrderPage } from './pages/OrderPage';

function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <ExchangeForm />
        <MarketStats />
        <ReservesList />
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#1a1d24] text-white">
        <ExchangeHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/order/:orderId" element={<OrderPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;