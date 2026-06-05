import '../styles/spotlight.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import bg from "../assets/Bartolomeo_Cavarozzi_-_Virgin_and_Child_with_Angels_-_Google_Art_Project.jpg"
import comingSoon from "../assets/comingSoon.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Spotlight = () => {
  const [creatives, setCreatives] = useState([]);

  useEffect(() => {
    const fetchCreatives = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/spotlight/getSpotlight`);
        setCreatives(res.data);
      } catch (err) {
        console.error("Failed to fetch creatives:", err);
      }
    };

    fetchCreatives();
  }, []);

  return (
    <div className="creative-container">
      {/* Header Section */}
      <header className="header-section" style={{
        backgroundImage: `url(${bg})`
      }}>
        <div className="header-content">
          <h1 className="creative-title">CREATIVE</h1>
          <div className="spotlight-container">
            
            <h1 className="spotlight-title">SPOTLIGHT</h1>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-content">
          <p className="banner-text">
            WE'RE NOT JUST <br />
            <span className="highlight-text">SHOWCASING TALENT,</span>
            <br />
            WE'RE CELEBRATING IT.
          </p>
        </div>
      </section>

      {/* Creatives Title + Grid */}
      <section className="creatives-section">
        {/* <h2 className="creatives-heading">MEET OUR
          <br/>CREATIVES
        </h2> */}
        <div className="creatives-grid">
          {creatives.map((creative) => (
            <div key={creative._id || creative.id} className="creative-card">
              <div className="creative-image-frame">
                <img
                  src={creative.imageUrl}
                  alt={`Creative ${creative.name}`}
                  className="creative-image"
                />
              </div>
              <h3 className="creative-name">Spotlight - {creative.name}</h3>
              {creative.mediaUrl && (
    <a
      href={creative.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm underline hover:opacity-70"
    >
      Visit Link
    </a>
  )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ backgroundImage: `url(${comingSoon})` }}>
        <div className="cta-content">
          <h2 className="cta-title">
            HAVE SOMETHING
            <br />
            AWESOME TO SHARE?
            <br />
            WE'D LOVE TO SEE IT!
          </h2>
          <a href="/contactus" className="cta-button">
            Get In Touch <span className="arrow">→</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Spotlight;
