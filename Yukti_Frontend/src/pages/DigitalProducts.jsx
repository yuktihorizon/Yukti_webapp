import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import SuccessToast from "../components/SuccessToast";
import ErrorToast from "../components/ErrorToast";
import "react-toastify/dist/ReactToastify.css";
import "../styles/digitalProducts.css";
import digitalHero from "../assets/digital-products-hero.png";
import capabilityVisualization from "../assets/digital-capability-visualization.jpg";
import capabilityManagement from "../assets/digital-capability-management.jpg";
import capabilityInsights from "../assets/digital-capability-insights.jpg";
import formBg from "../assets/digital-form-bg.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const INTEREST_OPTIONS = [
  "3D WalkThrough",
  "3D Renders",
  "VR Output",
  "Website creation",
  "Short Animations",
  "Digital Twin",
  "Media services",
  "Others",
];

const CAPABILITIES = [
  {
    title: "Virtual Reality",
    image: capabilityVisualization,
    alt: "Immersive virtual reality experience",
  },
  {
    title: "Ads, corporate films, Renders & walkthrough",
    image: capabilityManagement,
    alt: "Ads, corporate films, renders and walkthrough",
  },
  {
    title: "Custom programs & other digital services",
    image: capabilityInsights,
    alt: "Custom programs and other digital services",
  },
];

export default function DigitalProducts() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interests: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (option) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(option);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((item) => item !== option)
          : [...prev.interests, option],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_BASE_URL) {
      toast(<ErrorToast message="Form is not configured. Please try again later." />, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast(<ErrorToast message="Please fill in all required fields." />, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (formData.interests.length === 0) {
      toast(<ErrorToast message="Please select at least one interest." />, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact/createmessages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.name.trim(),
          lastName: "",
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: "Digital Products - Project Request",
          message: [
            "Source: Digital Products page",
            `Interests: ${formData.interests.join(", ")}`,
            `Phone: ${formData.phone.trim()}`,
          ].join("\n"),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      toast(<SuccessToast message="Project request sent! We'll email you soon." />, {
        position: "top-right",
        autoClose: 4000,
      });
      setFormData({ name: "", email: "", phone: "", interests: [] });
    } catch {
      toast(<ErrorToast message="Failed to submit. Please try again." />, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="digital-page">
      <section className="digital-hero" aria-label="Digital Products">
        <img src={digitalHero} alt="Digital Products" className="digital-hero-img" />
      </section>

      <section className="digital-intro">
        <div className="digital-intro-inner">
          <h2 className="digital-intro-title">
            Built To Support
            <br />
            The Entire Process
          </h2>
          <div className="digital-intro-copy">
            <p>
              Our digital products are designed to support every stage of the journey—from
              planning and coordination to visualization and delivery. They bring structure
              to complex processes, making collaboration clearer and decision-making more
              intentional.
            </p>
            <p>
              Built with simplicity and clarity in mind, each tool reduces friction and
              keeps work moving forward. The goal is not just digital efficiency, but a
              smoother path from idea to execution.
            </p>
          </div>
        </div>
      </section>

      <section className="digital-capabilities">
        <div className="digital-capabilities-inner">
          <p className="digital-capabilities-label">Capabilities</p>
          <div className="digital-capabilities-header">
            <h2 className="digital-capabilities-title">
              From Concept To Screen.
              <br />
              Before It Reaches The Floor.
            </h2>
            <p className="digital-capabilities-desc">
              We develop digital products and interfaces that support how your ideas are
              visualized, communicated, and brought to market—bridging design intent with
              practical execution.
            </p>
          </div>

          <div className="digital-capability-grid">
            {CAPABILITIES.map((item) => (
              <article key={item.title} className="digital-capability-card">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="digital-capability-img"
                />
                <div className="digital-capability-overlay" aria-hidden="true" />
                <div className="digital-capability-content">
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="digital-form-section"
        style={{ backgroundImage: `url(${formBg})` }}
      >
        <div className="digital-form-overlay" />
        <div className="digital-form-container">
          <h2>Start your project with clarity</h2>
          <p className="digital-form-subtitle">
            From shaping to validation—handled end-to-end
          </p>
          <form onSubmit={handleSubmit} className="digital-form">
            <div className="digital-form-row">
              <div className="digital-form-group">
                <label htmlFor="digital-name">Name</label>
                <input
                  type="text"
                  id="digital-name"
                  name="name"
                  placeholder="Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                />
              </div>
              <div className="digital-form-group">
                <label htmlFor="digital-email">Email</label>
                <input
                  type="email"
                  id="digital-email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="digital-form-group">
              <label htmlFor="digital-phone">Contact Number</label>
              <input
                type="tel"
                id="digital-phone"
                name="phone"
                placeholder="Contact Number *"
                value={formData.phone}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <fieldset className="digital-interest-fieldset">
              <legend className="digital-interest-legend">
                What are you interested in? <span className="digital-required">*</span>
              </legend>
              <div className="digital-interest-list">
                {INTEREST_OPTIONS.map((option, index) => {
                  const checked = formData.interests.includes(option);
                  return (
                    <label key={option} className="digital-interest-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleInterestToggle(option)}
                        required={formData.interests.length === 0 && index === 0}
                      />
                      <span className="digital-interest-box" aria-hidden="true" />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button type="submit" className="digital-submit-btn" disabled={submitting}>
              {submitting ? "Sending..." : "Submit Project Request"}
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
