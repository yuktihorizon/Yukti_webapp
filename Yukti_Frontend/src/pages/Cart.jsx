import React from 'react';
import { useCart} from '../pages/CartContext';
import {useState,useEffect} from "react";
import '../styles/cart.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
  const { cartItems, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const [showReminderBanner, setShowReminderBanner] = useState(false);


  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length > 0) {
      setShowReminderBanner(true);
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 500;
  const total = subtotal + shipping;

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

            <div className="cart-price">Rs. {item.price.toLocaleString()}</div>

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
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>Rs. {shipping.toLocaleString()}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>

        <button
          className="checkout-button"
          onClick={() => navigate('/checkoutpage')}
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
