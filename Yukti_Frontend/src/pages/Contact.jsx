import { useState } from "react"
import '../styles/contact.css'
import spotlight from '../assets/spotlight.jpeg'; 
import { ToastContainer, toast } from 'react-toastify';
import SuccessToast from '../components/SuccessToast';
import ErrorToast from '../components/ErrorToast';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    try {
      const response = await fetch(`${API_BASE_URL}/contact/createmessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
  
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
  
      const result = await response.json()
      console.log('Success:', result)
      toast(<SuccessToast message="Message sent successfully!" />, {
  position: "top-right",
  autoClose: 4000,
});
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      })
    } catch (error) {
      console.error('Error:', error)
      toast(<ErrorToast message="Failed to send message. Please try again later." />, {
  position: "top-right",
  autoClose: 4000,
});
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
        {/* <div className="chair-image"></div> */}
      </div>

      <div className="bottom-section">
        <div className="info-section">
          <h2 className="lets-talk">LETS TALK!</h2>

          <div className="contact-info">
            {/* <p>123 Style Avenue,</p>
            <p>City Heights,</p>
            <p>Delhi - 450789</p>
            <p>India</p> */}
            <p className="phone">8130507753</p>
            <p className="email">yuktihorizon@gmail.com</p>
          </div>

          <div className="social-lins">
            <a href="https://www.instagram.com/yukti_horizon?igsh=MzRmZGFsaWpvc2Vu&utm_source=qr" className="social-link">
            <span className="icon">Instagram &#8599;</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61576148707039" className="social-link">
              <span className="icon">Facebook &#8599;</span>
            </a>
            <a href="https://x.com/yuktihorizon?s=11" className="social-link">
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
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group subject-group">
              <label>Select Subject?</label>
              <div className="radio-options">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="general"
                    name="subject"
                    value="General Inquiry"
                    checked={formData.subject === "General Inquiry"}
                    onChange={handleChange}
                  />
                  <label htmlFor="general">General Inquiry</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="order"
                    name="subject"
                    value="Order Inquiry"
                    checked={formData.subject === "Order Inquiry"}
                    onChange={handleChange}
                  />
                  <label htmlFor="order">Order Inquiry</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="support"
                    name="subject"
                    value="Support"
                    checked={formData.subject === "Support"}
                    onChange={handleChange}
                  />
                  <label htmlFor="support">Custom Product Inquiry</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Write your message..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Send Message
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
