import React, { useEffect, useState } from 'react';
import '../styles/service.css';
import { ToastContainer, toast } from 'react-toastify';
import SuccessToast from '../components/SuccessToast';
import ErrorToast from '../components/ErrorToast';
import 'react-toastify/dist/ReactToastify.css';
import servicesCoverHero from '../assets/services-cover-hero.png';
import serviceFormBgLathe from '../assets/service-form-bg-lathe.png';
import latheImg1 from '../assets/store1.png';
import latheImg2 from '../assets/store2.png';
import protoImg1 from '../assets/store3.png';
import protoImg2 from '../assets/store4.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fallbackCapabilityBlocks = [
  {
    id: 'lathe',
    theme: 'dark',
    number: '01',
    label: 'LATHE',
    headingLines: ['Precision Shaping For', 'Structural Components'],
    paragraphs: [
      'We develop components through controlled lathe processes, ensuring accuracy in form, balance, and proportion. Each piece is shaped with precision to meet structural and design requirements before moving into final assembly.',
    ],
    images: [
      { src: latheImg1, alt: 'Lathe workshop' },
      { src: latheImg2, alt: 'Lathe craftsmanship' },
    ],
  },
  {
    id: 'prototyping',
    theme: 'light',
    number: '02',
    label: 'PROTOTYPING',
    headingLines: ["Tested Before It's Built", 'So Nothing Is Left', 'Unresolved.'],
    paragraphs: [
      'Prototyping is where ideas are tested and refined. We develop working models to study proportions, structure, and usability—ensuring each design performs as intended before moving forward.',
      'Through iteration and evaluation, we resolve details that cannot be defined on paper alone. This process allows us to adjust, improve, and confirm every aspect—reducing uncertainty in the final build.',
    ],
    images: [
      { src: protoImg1, alt: 'Prototype furniture' },
      { src: protoImg2, alt: 'Prototyping process' },
    ],
  },
];

export default function Service() {
  const [capabilityBlocks, setCapabilityBlocks] = useState(fallbackCapabilityBlocks);
  const [formData, setFormData] = useState({ name: '', email: '', projectType: '' });

  useEffect(() => {
    if (!API_BASE_URL) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}/service-page`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data.capabilityBlocks?.length) return;
        const merged = data.capabilityBlocks.map((block, bi) => {
          const fb = fallbackCapabilityBlocks[bi] || {};
          return {
            ...block,
            images: (block.images || []).map((img, ii) => ({
              alt: img.alt || fb.images?.[ii]?.alt || '',
              src: img.src?.trim() || fb.images?.[ii]?.src || '',
            })),
          };
        });
        setCapabilityBlocks(merged);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/contact/createmessages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.name,
          lastName: '',
          email: formData.email,
          phone: '',
          subject: 'Service Page - Project Request',
          message: `Project Type: ${formData.projectType}`,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit');
      toast(<SuccessToast message="Project request submitted!" />, {
        position: 'top-right',
        autoClose: 4000,
      });
      setFormData({ name: '', email: '', projectType: '' });
    } catch {
      toast(<ErrorToast message="Failed to submit. Please try again." />, {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  return (
    <main className="service-page">
      <section className="service-hero" aria-label="Our Services">
        <img src={servicesCoverHero} alt="" className="service-hero-img" />
        <div className="service-hero-overlay" />
        {/* <h1 className="service-hero-text">
          <span className="hero-word">Shape</span>
          <span className="hero-word">Test</span>
          <span className="hero-word">Refine</span>
        </h1> */}
      </section>

      <section className="capabilities-intro">
        <div className="capabilities-intro-container">
          <div className="capabilities-intro-title">
            <h2>OUR<br />CAPABILITIES</h2>
          </div>
          <div className="capabilities-intro-content">
            <p>
            We provide in-house precision lathe machining and prototype development through a combination of in-house capabilities and specialized collaborations, helping transform ideas into high-quality, production-ready solutions.
            </p>
          </div>
        </div>
      </section>

      {capabilityBlocks.map((block) => (
        <section
          key={block.id}
          className={`capability-section capability-${block.theme}`}
        >
          <div className="capability-header">
            <span className="capability-number">{block.number}</span>
            <span className="capability-label">{block.label}</span>
          </div>
          <div className="capability-body">
            <div className="capability-text">
              <h3 className="capability-heading">
                {block.headingLines.map((line, i) => (
                  <React.Fragment key={`${block.id}-h-${i}`}>
                    {i > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h3>
            </div>
            <div className="capability-description">
              {block.paragraphs.map((p, i) => (
                <p key={`${block.id}-p-${i}`}>{p}</p>
              ))}
            </div>
          </div>
          <div className="capability-images">
            {block.images.map((img, i) => (
              <div key={`${block.id}-img-${i}`} className="capability-img-wrapper">
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section
        className="service-form-section service-form-section--lathe"
        style={{ backgroundImage: `url(${serviceFormBgLathe})` }}
      >
        <div className="service-form-overlay" />
        <div className="service-form-container">
          <h2>Start your project<br />with clarity</h2>
          <p className="service-form-subtitle">
            From shaping to validation—handled end-to-end
          </p>
          <form onSubmit={handleSubmit} className="service-form">
            <div className="service-form-row">
              <div className="service-form-group">
                <label htmlFor="service-name">Name</label>
                <input
                  type="text"
                  id="service-name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="service-form-group">
                <label htmlFor="service-email">Email</label>
                <input
                  type="email"
                  id="service-email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="service-form-group">
              <label htmlFor="service-projectType">Project Type</label>
              <input
                type="text"
                id="service-projectType"
                name="projectType"
                placeholder="Enter your Project Type"
                value={formData.projectType}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="service-submit-btn">
              Submit Project Request
            </button>
          </form>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
    </main>
  );
}
