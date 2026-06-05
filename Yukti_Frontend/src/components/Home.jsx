import { useEffect, useRef } from "react";
import "../styles/home.css";
import { Link } from "react-router-dom";
import BlurImage1 from "../assets/blurimage1.png";
import BlurImage2 from "../assets/blurimage2.png";
import BlurImage3 from "../assets/blurimage3.png";
import YuktiTitle from "../assets/Layer1.jpg";
import YuktiHindi from "../assets/Layer2.png";
import YuktiVideo from "../assets/Yuktilogoanimation.mp4"

import ProductSlider from "./Homeproducts";
import Navbar from "./Navbar";

const Home = () => {

  useEffect(() => {
    if (sessionStorage.getItem("scrollToProducts") === "true") {
      scrollToProducts();
      sessionStorage.removeItem("scrollToProducts");
    }
  }, []);
  // Ref for scrolling to products section
  const productsRef = useRef(null);
  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-container">
       <Navbar scrollToProducts={scrollToProducts} />
      <div className="home-content">
        <div className="home-hero">
          <div className="home-text">
            <video
              src={YuktiVideo}
              autoPlay
              muted
              loop
              playsInline
              className="hero-title-video"
            />
          </div>
          <div className="hero-buttons">
            <div className="hero-buttons__third hero-buttons__third--left">
              <Link to="/allproducts" className="hero-buttons__link">
                <button type="button" className="shop-button">
                  Shop Now
                </button>
              </Link>
            </div>
            <div className="hero-buttons__third hero-buttons__third--center">
              <Link to="/service" className="hero-buttons__link">
                <button type="button" className="shop-button">
                  Our Services
                </button>
              </Link>
            </div>
            <div className="hero-buttons__third hero-buttons__third--right">
              <Link to="/blog" className="hero-buttons__link">
                <button type="button" className="shop-button">
                  Our Concepts
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div> 
      <div ref={productsRef} className="products-section">
  <ProductSlider />
</div>
      <section className="coming-soon">
        <div className="overlay">
          <h1>UP COMING</h1>
        </div>
      </section>
      
      <section className="blurred-products">
  <div className="blurred-container">
    {[
      { id: 1, name: "Triogen Posture Chair", image: BlurImage1 },
      { id: 2, name: "Study Table", image: BlurImage2 },
      { id: 3, name: "Half Cashews", image: BlurImage3 },
    ].map((item) => (
      <div key={item.id} className="blurred-item">
        <img src={item.image} alt={item.name} className="blurred-image" />
        <p className="product-name">{item.name}</p>
      </div>
    ))}
  </div>
</section>
    </div>
  );
};

export default Home;



