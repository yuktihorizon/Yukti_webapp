import { useState, useEffect } from "react"
import axios from "axios"
import '../styles/products.css'
import { useCart } from "../pages/CartContext";
import { Link } from "react-router-dom";

const Products = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [sortBy, setSortBy] = useState("default")
  const [loading, setLoading] = useState(true)
  const { cartItems } = useCart();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/category/getcategories`),
          axios.get(`${API_BASE_URL}/products/getproducts`)
        ])
        const filteredCategories = catRes.data.filter((cat) => cat.name.toLowerCase() !== "all")
        setCategories(filteredCategories)
        setProducts(prodRes.data)
      } catch (error) {
        console.error("Error fetching data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [API_BASE_URL])

  const handleCategoryClick = (category) => {
    setActiveCategory(category)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) =>
          product.category?._id ? product.category._id === activeCategory : product.category === activeCategory
        )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") return a.price - b.price
    if (sortBy === "price-high-low") return b.price - a.price
    return 0
  })

  return (
    <div className="shop-page">
      {Array.isArray(cartItems) && cartItems.length > 0 && (
        <div className="cart-reminder-banner">
          You have items in your cart — don't forget to complete your order.
        </div>
      )}

      <div className="shop-hero">
        <h1 className="shop-title">Our Collection</h1>
      </div>

      <div className="shop-container">
        <div className="shop-toolbar">
          <div className="category-filter">
            <button
              className={activeCategory === "all" ? "active" : ""}
              onClick={() => handleCategoryClick("all")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={activeCategory === category._id ? "active" : ""}
                onClick={() => handleCategoryClick(category._id)}
              >
                {category.name}
              </button>
            ))}
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
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">&#8377; {product.price?.toLocaleString('en-IN')}</p>
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
