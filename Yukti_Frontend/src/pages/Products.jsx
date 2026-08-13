import { useState, useEffect } from "react"
import axios from "axios"
import '../styles/products.css'
import { useCart } from "../pages/CartContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const MAIN_CATEGORIES = [
  "Consumer Products",
  "Industrial Products",
  "Industrial Services",
  "Digital Products",
]

const INDUSTRIAL_SERVICES = "Industrial Services"
const DIGITAL_PRODUCTS = "Digital Products"
const INDUSTRIAL_PRODUCTS = "Industrial Products"

const Products = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeMainCategory, setActiveMainCategory] = useState("Consumer Products")
  const [activeCategory, setActiveCategory] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { cartItems } = useCart();
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const main = searchParams.get("main")
    if (main === INDUSTRIAL_SERVICES) {
      navigate("/service", { replace: true })
      return
    }
    if (main === DIGITAL_PRODUCTS) {
      navigate("/digital-products", { replace: true })
      return
    }
    if (main && MAIN_CATEGORIES.includes(main)) {
      setActiveMainCategory(main)
      setActiveCategory("all")
    }
  }, [searchParams, navigate])

  useEffect(() => {
    if (!API_BASE_URL) {
      setFetchError(true)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchData = async () => {
      const MAX_RETRIES = 3
      const RETRY_DELAY_MS = 800

      setLoading(true)
      setFetchError(false)

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const [catRes, prodRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/category/getcategories`),
            axios.get(`${API_BASE_URL}/products/getproducts`)
          ])

          if (cancelled) return

          const filteredCategories = catRes.data.filter((cat) => cat.name.toLowerCase() !== "all")
          setCategories(filteredCategories)
          setProducts(prodRes.data)
          setLoading(false)
          return
        } catch (error) {
          console.error(`Error fetching data (attempt ${attempt}/${MAX_RETRIES})`, error)
          if (attempt < MAX_RETRIES) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt))
          } else if (!cancelled) {
            setFetchError(true)
            setLoading(false)
          }
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [API_BASE_URL, retryCount])

  const handleMainCategoryClick = (mainCategory) => {
    if (mainCategory === DIGITAL_PRODUCTS) {
      navigate("/digital-products")
      return
    }
    setActiveMainCategory(mainCategory)
    setActiveCategory("all")
  }

  const handleCategoryClick = (category) => {
    setActiveCategory(category)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const subCategories =
    activeMainCategory === INDUSTRIAL_PRODUCTS
      ? []
      : categories.filter((cat) => cat.mainCategory === activeMainCategory)

  const mainCategoryProducts = products.filter((product) => {
    const cat = product.category
    if (!cat) return false
    const mainCat = typeof cat === "object" ? cat.mainCategory : null
    return mainCat === activeMainCategory
  })

  const filteredProducts =
    activeCategory === "all"
      ? mainCategoryProducts
      : mainCategoryProducts.filter((product) =>
          product.category?._id ? product.category._id === activeCategory : product.category === activeCategory
        )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") return a.price - b.price
    if (sortBy === "price-high-low") return b.price - a.price
    return 0
  })

  const categoryLabel = (product) => {
    if (!product?.category) return ""
    if (typeof product.category === "object") {
      if (product.category.mainCategory === INDUSTRIAL_PRODUCTS) return ""
      return product.category.name || ""
    }
    return String(product.category)
  }

  return (
    <div className="shop-page">
      {Array.isArray(cartItems) && cartItems.length > 0 && (
        <div className="cart-reminder-banner">
          You have items in your cart — don't forget to complete your order.
        </div>
      )}

      <div className="shop-hero">
        <p className="shop-eyebrow">Shop/Explore</p>
        <h1 className="shop-title">Our Catalogue</h1>
        {!loading && (
          <p className="shop-subtitle">
            {sortedProducts.length} {sortedProducts.length === 1 ? "piece" : "pieces"} in {activeMainCategory.toLowerCase()}
            {activeMainCategory === INDUSTRIAL_PRODUCTS
              ? "."
              : " — filter by category or sort by price."}
          </p>
        )}
      </div>

      <div className="shop-container">
        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            <div className="main-category-filter">
              {MAIN_CATEGORIES.map((mainCat) =>
                mainCat === INDUSTRIAL_SERVICES ? (
                  <Link
                    key={mainCat}
                    to="/service"
                    className="main-category-link"
                  >
                    {mainCat}
                  </Link>
                ) : mainCat === DIGITAL_PRODUCTS ? (
                  <Link
                    key={mainCat}
                    to="/digital-products"
                    className="main-category-link"
                  >
                    {mainCat}
                  </Link>
                ) : (
                  <button
                    key={mainCat}
                    type="button"
                    className={activeMainCategory === mainCat ? "active" : ""}
                    onClick={() => handleMainCategoryClick(mainCat)}
                  >
                    {mainCat}
                  </button>
                )
              )}
            </div>

            {subCategories.length > 0 && (
              <div className="category-filter">
                <button
                  className={activeCategory === "all" ? "active" : ""}
                  onClick={() => handleCategoryClick("all")}
                >
                  All
                </button>
                {subCategories.map((category) => (
                  <button
                    key={category._id}
                    className={activeCategory === category._id ? "active" : ""}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}

            {!loading && sortedProducts.length > 0 && (
              <span className="shop-result-count" aria-live="polite">
                Showing {sortedProducts.length} of {mainCategoryProducts.length} products
              </span>
            )}
          </div>

          <div className="sort-container">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sortBy} onChange={handleSortChange}>
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : fetchError ? (
          <div className="shop-empty">
            <p>Unable to load products right now.</p>
            <button type="button" onClick={() => setRetryCount((n) => n + 1)}>
              Try again
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="shop-empty">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {sortedProducts.map((product) => (
              <Link to={`/products/${product._id}`} state={{ product }} className="product-card" key={product._id}>
                <div className="product-image-container">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="product-image"
                  />
                  {categoryLabel(product) && (
                    <span className="product-card-badge">{categoryLabel(product)}</span>
                  )}
                </div>
                <div className="product-info">
                  {product.series && <p className="product-series">{product.series}</p>}
                  <h3 className="product-name">{product.name}</h3>
                  {product.description && (
                    <p className="product-card-excerpt">{product.description}</p>
                  )}
                  <div className="product-card-footer">
                    <p className="product-price">&#8377; {product.price?.toLocaleString("en-IN")} <span className="price-gst">(GST inc.)</span></p>
                    <span className="product-card-cta">View details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
