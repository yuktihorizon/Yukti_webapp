import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/productDetails.css";
import { useCart } from "../pages/CartContext";
import { toast } from "react-toastify";
import chairsVideo from "../assets/chairvideo.mp4";

const ProductDetail = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("white");
  const [expandedSection, setExpandedSection] = useState(null);
  const [mainImage, setMainImage] = useState("/placeholder.svg");
  const [showImageModal, setShowImageModal] = useState(false);
  const { addToCart } = useCart();


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/getproducts`);
        const allProducts = response.data;
        const foundProduct = allProducts.find((p) => p._id === productId);
        if (!foundProduct) return navigate("/");

        setProduct(foundProduct);
        setSelectedColor(foundProduct.colors?.[0] || "white");

        // Use first thumbnail or fallback to first image
        if (foundProduct.thumbnails?.length > 0) {
          setMainImage(foundProduct.thumbnails[0]);
        } else if (foundProduct.images?.length > 0) {
          setMainImage(foundProduct.images[0]);
        } else {
          setMainImage("/placeholder.svg");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/");
      }
    };

    fetchProduct();
  }, [productId, navigate, API_BASE_URL]);

  if (!product) return <div className="product-container">Loading...</div>;

  const categoryName =
    (typeof product.category === "object" ? product.category.name : product.category || "").toLowerCase();
  const isChairsCategory = categoryName.includes("chair");

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/placeholder.svg"];

  const currentImageIndex = Math.max(productImages.indexOf(mainImage), 0);

  const showNextImage = () => {
    if (productImages.length <= 1) return;
    const nextIndex = (currentImageIndex + 1) % productImages.length;
    setMainImage(productImages[nextIndex]);
  };

  const showPrevImage = () => {
    if (productImages.length <= 1) return;
    const prevIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    setMainImage(productImages[prevIndex]);
  };

  // Turn API keys (camelCase, snake_case) into readable labels, e.g. seatHeight → Seat Height
  const formatFieldLabel = (rawKey) => {
    if (!rawKey || typeof rawKey !== 'string') return '';
    const spaced = rawKey
      .replace(/_/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .trim();
    return spaced
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format price to currency (assuming INR here)
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
  };

  return (
    <div className="product-page-wrapper">
      {/* Fullscreen background video per category */}
      {isChairsCategory ? (
        <div className="youtube-video-background">
          <video
            className="background-video"
            src={chairsVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      ) : (
        product.videoUrl && (
          <div className="youtube-video-background">
            <iframe
              src={`https://www.youtube.com/embed/${new URL(
                product.videoUrl.trim()
              ).searchParams.get("v")}?autoplay=1&mute=1&loop=1&playlist=${new URL(
                product.videoUrl.trim()
              ).searchParams.get("v")}`}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            >
              Play Video
            </iframe>
          </div>
        )
      )}
    <div className="product-container">
      <div className="product-left">
        {/* Video Button */}
        {product.videoUrl && (
  <div className="background-video-container">
    <video
      className="background-video"
      src={product.videoUrl.trim()}
      autoPlay
      muted
      loop
      playsInline
    />
  </div>
)}

    

        {/* Title */}
        <div className="product-title">
          <h2>{product.series}</h2>
          <h1>{product.name}</h1>
        </div>

        {/* Description */}
        <p className="product-description">{product.description}</p>

        <button className="buy-now-btn">Buy Now</button>

        <div className="main-image-container">
          <div className="main-image-wrapper">
            <img
              src={mainImage}
              alt={product.name}
              className="main-product-image"
              onClick={() => setShowImageModal(true)}
            />
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-btn gallery-nav-prev"
                  onClick={showPrevImage}
                  aria-label="Previous image"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  className="gallery-nav-btn gallery-nav-next"
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  &#8250;
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail strip for all product images */}
        {productImages.length > 1 && (
          <div className="thumbnail-container">
            {productImages.map((img) => (
              <button
                key={img}
                type="button"
                className={`thumbnail${
                  img === mainImage ? " active" : ""
                }`}
                onClick={() => {
                  setMainImage(img);
                }}
                aria-label="Select product image"
              >
                <img src={img} alt={product.name} />
              </button>
            ))}
          </div>
        )}
    
      </div>

      <div className="product-right">
        {/* Price */}
        <div className="price-section">
          <h2>{formatPrice(product.price)}</h2>
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="colors-section">
            <h3>Colours</h3>
            <div className="color-options">
              {product.colors.map((color) => (
                <div
                  key={color}
                  className={`color-circle ${color} ${selectedColor === color ? "selected" : ""}`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accordions: you can display dimensions and specifications */}
        <div className="accordion-sections">
          <div className="accordion-item">
            <div className="accordion-header" onClick={() => toggleSection("Dimensions")}>
              <h3>Dimensions</h3>
              <svg
                className={`arrow-icon ${expandedSection === "Dimensions" ? "expanded" : ""}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {expandedSection === "Dimensions" && (
              <div className="accordion-content">
                <ul>
                  {Object.entries(product.dimensions || {}).map(([key, val]) => (
                    <li key={key}>
                      <b>{formatFieldLabel(key)}:</b> {String(val)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <div className="accordion-header" onClick={() => toggleSection("Specifications")}>
              <h3>Specifications</h3>
              <svg
                className={`arrow-icon ${expandedSection === "Specifications" ? "expanded" : ""}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {expandedSection === "Specifications" && (
              <div className="accordion-content">
                <ul>
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <li key={key}>
                      <b>{formatFieldLabel(key)}:</b> {String(val)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      <button
  className="add-to-cart-btn"
  onClick={() => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      color: selectedColor,
    });
    toast.success(`${product.name} added to cart!`);
  }}
>
  Add to cart
</button>
      </div>
    </div>

    {/* Image Modal */}
    {showImageModal && (
      <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="modal-close-btn"
            onClick={() => setShowImageModal(false)}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img 
            src={mainImage} 
            alt={product.name}
            className="modal-image"
          />
          {productImages.length > 1 && (
            <>
              <button
                type="button"
                className="modal-nav-btn modal-nav-prev"
                onClick={showPrevImage}
                aria-label="Previous image"
              >
                &#8249;
              </button>
              <button
                type="button"
                className="modal-nav-btn modal-nav-next"
                onClick={showNextImage}
                aria-label="Next image"
              >
                &#8250;
              </button>
            </>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default ProductDetail;















