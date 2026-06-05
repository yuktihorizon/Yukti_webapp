import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { useSearch } from "../components/SearchContext";
import "../styles/navbar.css";
import Search from "../pages/Search";
import logo from "../assets/yuktigold.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();

  const isSearchAllowed = location.pathname === "/allproducts";

  // Close menu when clicking outside
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking on a link
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  // Close search when clicking outside
  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo-container" onClick={handleLinkClick}>
          <img src={logo} alt="Yukti Logo" className="logo" />
          <span className="logo-text">Yukti</span>
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
          

          {/* Search Button - Only show on products page */}
          {isSearchAllowed && (
            <button 
              className="icon-button" 
              onClick={handleSearchToggle}
              aria-label="Search products"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
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

      {/* Search Overlay */}
      {showSearch && isSearchAllowed && (
        <div className="search-overlay">
          <Search
            currentPath={location.pathname}
            onClose={() => setShowSearch(false)}
            query={searchQuery}
            setQuery={setSearchQuery}
          />
        </div>
      )}

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
