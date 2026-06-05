import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Footer from "./components/Footer"; 
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";

const Home = lazy(() => import("./components/Home"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const ExperienceStore = lazy(() => import("./pages/ExperienceStore"));
const Spotlight = lazy(() => import("./pages/Spotlight"));
const Service = lazy(() => import("./pages/Service"));
const Cart = lazy(() => import("./pages/Cart"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetail = lazy(() => import("./pages/ProductDetails"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Blog = lazy(() => import("./pages/Blog"));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <main className="bg-primary text-tertiary text-left">
      <ScrollToTop />
        <Header />
          <ToastContainer position="top-right" autoClose={3000} />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/allproducts" element={<Products/>} />
            <Route path="/about" element={< About/>} />
            <Route path="/experience-store" element={<ExperienceStore/>} />
            <Route path="/spotlight" element={<Spotlight/>} />
            <Route path="/service" element={<Service/>} />
            <Route path="/contactus" element= {<Contact/>} />
            <Route path="/cart" element= {<Cart/>} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/checkoutpage" element={<CheckoutPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:category/:id" element={<Blog />} />
          </Routes>
        </Suspense>
        <Footer /> 
    </main>
  );
}
