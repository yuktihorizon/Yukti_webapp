import React, { useState, useEffect } from 'react';
import { useCart } from '../pages/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/checkout.css';
import {
  getShippingSummary,
  normalizePinCode,
  OUTSIDE_NCR_SHIPPING_ESTIMATE,
  readSavedPinCode,
  savePinCode,
} from '../data/ncrPinCodes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: normalizePinCode(location.state?.pinCode) || readSavedPinCode(),
    phone: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingInfo = getShippingSummary(formData.zipCode);
  const shipping = shippingInfo.shipping;
  const total = subtotal + shipping;
  const pinReady = shippingInfo.status !== 'pending';
  const pinServiceable = shippingInfo.status === 'ncr';
  const pinOutside = shippingInfo.status === 'outside';

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Load states from API
    fetchStates();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch states from API
  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await axios.get(`${API_BASE_URL}/location/states`);
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load states');
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities by state from API
  const fetchCitiesByState = async (state) => {
    try {
      setLoadingCities(true);
      const response = await axios.get(`${API_BASE_URL}/location/cities/${encodeURIComponent(state)}`);
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Update cities when state changes
  useEffect(() => {
    if (formData.state) {
      fetchCitiesByState(formData.state);
      // Reset city when state changes
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'zipCode' ? savePinCode(value) : value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);
    try {
      // Create order on backend
      const orderResponse = await axios.post(`${API_BASE_URL}/payment/create-order`, {
        amount: total,
        currency: 'INR',
        receipt: `order_${Date.now()}`
      });

      const { orderId, amount } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_APP_RAZOR_PAY_API_KEY,
        amount: amount,
        currency: 'INR',
        name: 'Yukti Horizon',
        description: 'Furniture Purchase',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(`${API_BASE_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              toast.success('Payment successful!');
              
              // Prepare order details for thank you page
              const orderDetails = {
                orderId: response.razorpay_order_id,
                customerEmail: formData.email,
                customerName: `${formData.firstName} ${formData.lastName}`,
                items: cartItems,
                subtotal: subtotal,
                shipping: shipping ?? 0,
                shippingBilledSeparately: pinOutside,
                shippingEstimate: pinOutside ? OUTSIDE_NCR_SHIPPING_ESTIMATE : null,
                total: total,
                shippingAddress: {
                  address: formData.address,
                  apartment: formData.apartment,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  phone: formData.phone
                }
              };
              
              clearCart();
              navigate('/thank-you', { state: { orderDetails } });
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart before checkout.</p>
          <button onClick={() => navigate('/allproducts')} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* LEFT FORM SECTION */}
      <div className="checkout-left">
        <h2>Contact</h2>
        <input 
          type="email" 
          placeholder="Email *" 
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <h2>Delivery</h2>
        <input 
          type="text" 
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="Pin code *" 
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          required
        />
        <p className={`pin-hint ${pinOutside ? 'pin-hint--note' : ''}`}>
          {!pinReady
            ? 'Enter your 6-digit pin code first. The total updates after that.'
            : pinServiceable
              ? 'This pin code is on the NCR list. Shipping Rs. 1,000 is added to the total.'
              : `Shipping bill sent separately for this pin code. Estimated ${OUTSIDE_NCR_SHIPPING_ESTIMATE}.`}
        </p>
        <div className="name-row">
          <input 
            type="text" 
            placeholder="First Name *" 
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            minLength={2}
          />
          <input 
            type="text" 
            placeholder="Last Name *" 
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            minLength={2}
          />
        </div>
        <input 
          type="text" 
          placeholder="Address *" 
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
        <input 
          type="text" 
          placeholder="Apartment, Building, etc." 
          name="apartment"
          value={formData.apartment}
          onChange={handleInputChange}
        />

        <div className="address-row">
          <select 
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            disabled={loadingStates}
          >
            <option value="">
              {loadingStates ? 'Loading states...' : 'Select State *'}
            </option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select 
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            disabled={!formData.state || loadingCities}
          >
            <option value="">
              {loadingCities ? 'Loading cities...' : 'Select City *'}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <input 
          type="tel" 
          placeholder="Phone *" 
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          minLength={8}
        />

        <button 
          className="pay-now" 
          onClick={handlePayment}
          disabled={loading || !pinReady}
        >
          {loading ? 'Processing...' : `Pay Now - Rs. ${total.toLocaleString()}`}
        </button>
      </div>

      {/* RIGHT CART SUMMARY SECTION */}
      <div className="checkout-right">
        {cartItems.map((item) => (
          <div className="product-summary" key={item._id}>
            <img src={item.images?.[0] || item.image} alt={item.name} />
            <div>
              <p><strong>{item.name}</strong></p>
              <p>Rs. {item.price.toLocaleString()} <span className="price-gst">(GST inc.)</span> × {item.quantity}</p>
            </div>
          </div>
        ))}

        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {!pinReady
                ? 'Enter pin code'
                : pinServiceable
                  ? `Rs. ${shipping.toLocaleString()}`
                  : 'Billed separately'}
            </span>
          </div>
          {pinOutside && (
            <p className="shipping-separate-note">
              Shipping bill sent separately for this pin code. Estimated {OUTSIDE_NCR_SHIPPING_ESTIMATE}.
            </p>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
          <p className="including-tax">Including Tax</p>
        </div>
      </div>
    </div>
  );
}
