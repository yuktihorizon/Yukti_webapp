import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import "../styles/navbar.css";
import headerLogo from "../assets/yuktiHorizonHeaderLogo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();

  // Close menu when clicking outside
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking on a link
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo-container" onClick={handleLinkClick}>
          <img src={headerLogo} alt="Yukti Horizon" className="logo logo-horizon" />
        </Link>

        {/* Mobile Hamburger Menu */}
        <button 
          className="menu-toggle" 
          onClick={handleMenuToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Menu */}
        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <Link 
            to="/allproducts" 
            className="nav-link" 
            onClick={handleLinkClick}
          >
            All Products
          </Link>
          {location.pathname !== "/" && (
            <Link 
              to="/service" 
              className="nav-link" 
              onClick={handleLinkClick}
            >
              Our Services
            </Link>
          )}
          <Link 
            to="/experience-store" 
            className="nav-link" 
            onClick={handleLinkClick}
          >
            Our Experience Store
          </Link>
          <Link 
            to="/about" 
            className="nav-link" 
            onClick={handleLinkClick}
          >
            About
          </Link>
          <Link 
            to="/spotlight" 
            className="nav-link" 
            onClick={handleLinkClick}
          >
            Creative Spotlight
          </Link>
          {location.pathname !== "/" && (
            <Link 
              to="/blog" 
              className="nav-link" 
              onClick={handleLinkClick}
            >
              Our Concepts
            </Link>
          )}
          

          {/* Cart Button */}
          <Link 
            to="/cart" 
            className="icon-button" 
            onClick={handleLinkClick}
            style={{ position: 'relative' }}
            aria-label="Shopping cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartItems.length > 0 && (
              <span className="cart-badge" aria-label={`${cartItems.length} items in cart`}>
                {cartItems.length}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={handleMenuToggle}
          aria-hidden="true"
        ></div>
      )}
    </header>
  );
};

export default Navbar;
