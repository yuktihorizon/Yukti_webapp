import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/thankYou.css';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from location state or URL params
    const orderData = location.state?.orderDetails;
    if (orderData) {
      setOrderDetails(orderData);
    } else {
      // If no order details, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  if (!orderDetails) {
    return <div className="loading">Loading...</div>;
  }

  const { 
    orderId, 
    customerEmail, 
    items, 
    subtotal, 
    shipping, 
    total,
    customerName,
    shippingAddress 
  } = orderDetails;

  return (
    <div className="thank-you-page">
      <div className="thank-you-container">
        {/* Left Section - Thank You Message */}
        <div className="thank-you-left">
          <h1 className="thank-you-title">Thanks for your order</h1>
          <p className="confirmation-message">
            We'll send confirmation and delivery updates to {customerEmail}
          </p>
          <div className="order-info">
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Order Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/allproducts')}
          >
            Continue Shopping
          </button>
        </div>

        {/* Right Section - Order Summary */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          
          {/* Product Items */}
          <div className="product-items">
            {items.map((item, index) => (
              <div key={index} className="product-item">
                <div className="product-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="product-details">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">₹{item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="cost-breakdown">
            <div className="cost-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="cost-row">
              <span>Shipping</span>
              <span>₹{shipping.toLocaleString()}</span>
            </div>
            <div className="cost-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <p className="tax-note">Including Tax</p>
          </div>

          {/* Shipping Address */}
          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <p>{customerName}</p>
            <p>{shippingAddress.address}</p>
            {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
