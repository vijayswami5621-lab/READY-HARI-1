/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AppDownloadPopup from './components/AppDownloadPopup';
import VisitorTracker from './components/VisitorTracker';

import Home from './pages/Home';
import About from './pages/About';
import Founder from './pages/Founder';
import Gita from './pages/Gita';
import Ramcharitmanas from './pages/Ramcharitmanas';
import Sanskrit from './pages/Sanskrit';
import Contact from './pages/Contact';
import JoinUs from './pages/JoinUs';

// New spiritual store, stutis, and published blogs pages
import Store from './pages/Store';
import ProductDetails from './pages/ProductDetails';
import Stutis from './pages/Stutis';
import StutiDetails from './pages/StutiDetails';
import BlogList from './pages/Blog';
import BlogDetails from './pages/BlogDetails';

// User Authentication, Profile, Spiritual Gallery, and Quotes routes
import { AuthProvider } from './lib/auth';
import { ErrorProvider } from './lib/error';
import Gallery from './pages/Gallery';
import Quotes from './pages/Quotes';
import Download from './pages/Download';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Dedicated Full-Page eCommerce & Payment routes
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import TrackOrder from './pages/TrackOrder';

export default function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <BrowserRouter>
        <ScrollToTop />
        <VisitorTracker />
        <div className="flex flex-col min-h-screen">
          {/* Render App Download Banner at the very top of the website */}
          <AppDownloadPopup />
          
          <Navbar />
          
          <main className="flex-grow pt-[88px] sm:pt-[94px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/founder" element={<Founder />} />
              <Route path="/gita" element={<Gita />} />
              <Route path="/ramcharitmanas" element={<Ramcharitmanas />} />
              <Route path="/sanskrit" element={<Sanskrit />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/join-us" element={<JoinUs />} />
              
              {/* Spiritual Store, Stutis, and Blogs */}
              <Route path="/store" element={<Store />} />
              <Route path="/store/product/:id" element={<ProductDetails />} />
              <Route path="/stutis" element={<Stutis />} />
              <Route path="/stutis/:id" element={<StutiDetails />} />
              <Route path="/stuti" element={<Stutis />} />
              <Route path="/stuti/:id" element={<StutiDetails />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />

              {/* User Profile, Gallery, Quotes & App Download */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/download" element={<Download />} />
              <Route path="/app-download" element={<Download />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />

              {/* Dedicated Full-Page eCommerce & Payment routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="/order/track" element={<TrackOrder />} />
              <Route path="/order/track/:orderId" element={<TrackOrder />} />

              {/* Catch-all unknown routes and legacy admin routes - redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
          <FloatingWhatsApp />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ErrorProvider>
  );
}
