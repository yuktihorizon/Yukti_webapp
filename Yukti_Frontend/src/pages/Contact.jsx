import { useState } from "react"
import '../styles/contact.css'
import spotlight from '../assets/spotlight.jpeg'; 
import { ToastContainer, toast } from 'react-toastify';
import SuccessToast from '../components/SuccessToast';
import ErrorToast from '../components/ErrorToast';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SERVICE_TYPES = [
  'Lathe/Turning',
  'Product Prototyping',
  'Digital Products',
  'General Enquiry',
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    additionalNote: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.serviceType ||
      !formData.additionalNote.trim()
    ) {
      toast(<ErrorToast message="Please fill in all required fields." />, {
        position: "top-right",
        autoClose: 4000,
      })
      return
    }

    if (!API_BASE_URL) {
      toast(<ErrorToast message="Form is not configured. Please try again later." />, {
        position: "top-right",
        autoClose: 4000,
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/contact/createmessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.name.trim(),
          lastName: '',
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: 'Contact Us - Project Request',
          message: [
            'Source: Contact Us page',
            `Service Type: ${formData.serviceType}`,
            `Additional Note: ${formData.additionalNote.trim()}`,
          ].join('\n'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast(<SuccessToast message="Project request submitted!" />, {
        position: "top-right",
        autoClose: 4000,
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        additionalNote: "",
      })
    } catch (error) {
      console.error('Error:', error)
      toast(<ErrorToast message="Failed to submit. Please try again later." />, {
        position: "top-right",
        autoClose: 4000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`contact-page className}`}>
      <div className="top-section" style={{
    backgroundImage: `url(${spotlight})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
        <div className="heading-container">
          <h1 className="main-heading">GET IN</h1>
          <h1 className="main-heading touch">TOUCH!</h1>
        </div>
      </div>

      <div className="bottom-section">
        <div className="info-section">
          <h2 className="lets-talk">LETS TALK!</h2>

          <div className="contact-info">
            <p className="phone">8130507753</p>
            <p className="email">yuktihorizon@gmail.com</p>
          </div>

          <div className="social-lins">
            <a
              href="https://www.instagram.com/yukti_horizon?igsh=MzRmZGFsaWpvc2Vu&utm_source=qr"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
            <span className="icon">Instagram &#8599;</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61576148707039"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon">Facebook &#8599;</span>
            </a>
            <a
              href="https://x.com/yuktihorizon?s=11"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon">Twitter &#8599;</span>
            </a>
          </div>
        </div>

        <div className="description-text">
          <p>
            Whether you're looking for the perfect piece of furniture or have questions about your order, we'll love to
            help. Reach out to us with your thoughts, and we'll get back to you as soon as possible. Bring your vision
            to life.
          </p>
        </div>

        <div className="contact-form-container">
          <div className="contact-form-heading">
            <h3>Start your project with clarity</h3>
            <p>From shaping to validation—handled end-to-end</p>
          </div>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Name *</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email *</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-phone">Contact Number *</label>
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  placeholder="Enter your contact number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-serviceType">Service Type *</label>
                <select
                  id="contact-serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a service</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-additionalNote">Additional Note *</label>
              <textarea
                id="contact-additionalNote"
                name="additionalNote"
                placeholder="Share any project details or requirements"
                value={formData.additionalNote}
                onChange={handleChange}
                rows={4}
                required
                minLength={5}
              />
            </div>

            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? "Sending..." : "Submit Project Request"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  )
}

export default Contact;
