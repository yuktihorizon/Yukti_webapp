import React from 'react';
import { useCart} from '../pages/CartContext';
import {useState,useEffect} from "react";
import '../styles/cart.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin } from 'lucide-react';
import {
  getShippingSummary,
  normalizePinCode,
  OUTSIDE_NCR_SHIPPING_DISCLAIMER,
  readSavedPinCode,
  savePinCode,
} from '../data/ncrPinCodes';

const Cart = () => {
    const navigate = useNavigate();
  const { cartItems, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const [showReminderBanner, setShowReminderBanner] = useState(false);
  const [pinCode, setPinCode] = useState(() => readSavedPinCode());

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length > 0) {
      setShowReminderBanner(true);
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingInfo = getShippingSummary(pinCode);
  const total = subtotal + shippingInfo.shipping;

  const handlePinChange = (e) => {
    setPinCode(savePinCode(e.target.value));
  };

  const handleCheckout = () => {
    const pin = normalizePinCode(pinCode);
    if (pin.length !== 6) {
      toast.error('Enter your 6-digit delivery pin code to continue.');
      return;
    }
    savePinCode(pin);
    navigate('/checkoutpage', { state: { pinCode: pin } });
  };

  return (
    <div className="cart-container">
      <div className="cart-left">
        <h1 className="cart-title">My Cart</h1>
          {/* 👇 Banner if returning with items in cart */}
        {showReminderBanner && cartItems.length > 0 && (
          <div className="cart-banner warning">
            🛒 You still have items in your cart. Don't forget to complete your order!
          </div>
        )}
        <p className="cart-item-count">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</p>

        <hr className="divider" />

        <div className="cart-header-row">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
        </div>

        <hr className="divider" />

        {cartItems.map((item) => (
          <div className="cart-item-row" key={item._id}>
            <div className="cart-product-info">
              <img src={item.image} alt={item.name} className="product-images" />
              <div>
                <h3>{item.name}</h3>
                <p className="product-desc">You can add product details here.</p>
                <button className="remove-btn" onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            </div>

            <div className="cart-price">Rs. {item.price.toLocaleString()} <span className="price-gst">(GST inc.)</span></div>

            <div className="cart-quantity">
              <button onClick={() => decrementQuantity(item._id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => incrementQuantity(item._id)}>+</button>
            </div>
          </div>
        ))}

        <hr className="divider" />
      </div>

      <div className="cart-right">
        <div className={`cart-pin ${shippingInfo.status !== 'pending' ? `cart-pin--${shippingInfo.status}` : ''}`}>
          <label className="cart-pin-label" htmlFor="cart-pin">Delivery pin</label>
          <div className="cart-pin-field">
            <MapPin size={16} strokeWidth={1.75} />
            <input
              id="cart-pin"
              className="cart-pin-input"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="000000"
              value={pinCode}
              onChange={handlePinChange}
            />
          </div>
          {shippingInfo.status === 'ncr' && (
            <p className="cart-pin-status">NCR · Rs. 1,000 shipping included</p>
          )}
          {shippingInfo.status === 'outside' && (
            <p className="cart-pin-status">{OUTSIDE_NCR_SHIPPING_DISCLAIMER}</p>
          )}
          {shippingInfo.status === 'pending' && (
            <p className="cart-pin-status">Enter 6 digits to calculate shipping</p>
          )}
        </div>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>
            {shippingInfo.status === 'pending'
              ? '—'
              : shippingInfo.status === 'ncr'
                ? `Rs. ${shippingInfo.shipping.toLocaleString()}`
                : 'Billed separately'}
          </span>
        </div>
        {shippingInfo.status === 'outside' && (
          <p className="shipping-note shipping-note--alert">{OUTSIDE_NCR_SHIPPING_DISCLAIMER}</p>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>

        <button
          className="checkout-button"
          onClick={handleCheckout}
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
