import { lazy, Suspense, useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Footer from "./components/Footer"; 
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import BackgroundAudioToggle from "./components/BackgroundAudioToggle";
import { BackgroundAudioProvider } from "./context/BackgroundAudioContext";

const Home = lazy(() => import("./components/Home"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const ExperienceStore = lazy(() => import("./pages/ExperienceStore"));
const Spotlight = lazy(() => import("./pages/Spotlight"));
const Service = lazy(() => import("./pages/Service"));
const DigitalProducts = lazy(() => import("./pages/DigitalProducts"));
const Cart = lazy(() => import("./pages/Cart"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetail = lazy(() => import("./pages/ProductDetails"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Blog = lazy(() => import("./pages/Blog"));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const splashTimerRef = useRef(null);

  const finishSplash = useCallback(() => {
    if (splashTimerRef.current) {
      clearTimeout(splashTimerRef.current);
      splashTimerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Preload route chunks during splash so pages mount quickly afterward
    import("./components/Home");
    import("./pages/Products");

    splashTimerRef.current = setTimeout(finishSplash, 7000);
    return () => {
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    };
  }, [finishSplash]);

  return (
    <BackgroundAudioProvider>
      {isLoading && (
        <Loading fullScreen onFinish={finishSplash} />
      )}
      <BackgroundAudioToggle />
      <main className="bg-primary text-tertiary text-left">
        <ScrollToTop />
        <Header />
        <ToastContainer position="top-right" autoClose={3000} />
        {!isLoading && (
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/allproducts" element={<Products/>} />
            <Route path="/about" element={< About/>} />
            <Route path="/experience-store" element={<ExperienceStore/>} />
            <Route path="/spotlight" element={<Spotlight/>} />
            <Route path="/service" element={<Service/>} />
            <Route path="/digital-products" element={<DigitalProducts />} />
            <Route path="/contactus" element= {<Contact/>} />
            <Route path="/cart" element= {<Cart/>} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/checkoutpage" element={<CheckoutPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:category/:id" element={<Blog />} />
          </Routes>
        </Suspense>
        )}
        <Footer /> 
      </main>
    </BackgroundAudioProvider>
  );
}
