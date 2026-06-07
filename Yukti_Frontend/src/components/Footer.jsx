import React from 'react';
// import logo from "../assets/whitelogo.png";
import footerBrandLogo from "../assets/yuktiHorizonLogo.png";
import { Link } from 'react-router-dom';
import '../styles/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              {/* <img src={logo} alt="Yukti" className="footer-logo-img" /> */}
              <img
                src={footerBrandLogo}
                alt="Yukti Horizon"
                className="footer-logo-img footer-logo-img-secondary"
              />
            </div>
            <p className="footer-tagline">
            खड्गेन आक्रम्य भुंजीत, वीर भोग्या वसुंधरा॥
            </p>
            {/* <a href="#products" className="footer-link">
              Shop Now
            </a> */}
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-links-title">About</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to="/about" className="footer-link">Our Story</Link> 
                </li>
                {/* <li>
                  <a href="#team">Team</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#locations">Locations</a>
                </li>
                <li>
                  <a href="#sustainability">Sustainability</a>
                </li> */}
              </ul>
            </div>

            {/* <div className="footer-links-column">
              <h3 className="footer-links-title">Policies</h3>
              <ul className="footer-links-list">
                <li>
                  <a href="#shipping">Shipping</a>
                </li>
                <li>
                  <a href="#returns">Returns</a>
                </li>
                <li>
                  <a href="#warranty">Warranty</a>
                </li>
                <li>
                  <a href="#privacy">Privacy</a>
                </li>
                <li>
                  <a href="#terms">Terms of Use</a>
                </li>
              </ul>
            </div> */}

            <div className="footer-links-column">
              <h3 className="footer-links-title">Support</h3>
              <ul className="footer-links-list">
                {/* <li>
                  <a href="#faq">FAQ</a>
                </li> */}
                 <li>
                <Link to="/contactus" className="footer-link">Contact Us</Link> 
                </li>
                {/* <li>
                  <a href="#care">Care Guide</a>
                </li> */}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-links">
            <a
              href="https://www.instagram.com/yukti_horizon?igsh=MzRmZGFsaWpvc2Vu&utm_source=qr"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61576148707039"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a
              href="https://x.com/yuktihorizon?s=11"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
          </div>
          <p className="copyright">© {new Date().getFullYear()} Yukti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

