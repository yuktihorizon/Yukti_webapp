import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link,useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/Homeproducts.css"

export default function ProductSlider() {
  const [categories, setCategories] = useState([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
 const fetchData = async () => {
  try {
    setLoading(true)
    const [catRes, prodRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/category/getcategories`),
      axios.get(`${API_BASE_URL}/products/getproducts`)
    ])

    const categoriesFromAPI = catRes.data.filter(cat => cat.name.toLowerCase() !== "all")
    const products = prodRes.data

    const catMap = categoriesFromAPI.reduce((acc, cat) => {
      acc[cat._id] = { id: cat._id, name: cat.name, products: [] }
      return acc
    }, {})

    products.forEach((product) => {
      const catId = product.category?._id || product.category
      if (catMap[catId]) {
        catMap[catId].products.push(product)
      } else {
        // Unknown category; skip
      }
    })

    const finalList = Object.values(catMap)
    setCategories(finalList)
  } catch (error) {
    console.error("Failed to fetch categories or products", error)
  } finally {
    setLoading(false)
  }
}


    fetchData()
  }, [API_BASE_URL])

  const currentCategory = categories[currentCategoryIndex] || { name: "", products: [] }
  const isServiceCategory = currentCategory.name?.toLowerCase() === "service" || currentCategory.name?.toLowerCase().includes("service")

  const goToNextCategory = () => {
    setDirection(1)
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length)
  }

  const goToPrevCategory = () => {
    setDirection(-1)
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length)
  }

  const handleBuyNow = (product) => {
    if (isServiceCategory) {
      navigate("/contactus")
      return
    }
    navigate(`/products/${product._id}`, { state: { product } })
  }

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 }),
  }

  if (loading) {
    return <div className="product-slider-container">Loading products...</div>
  }
  const productsToShow = currentCategory.products.slice(0, 3)
  while (productsToShow.length < 3) {
    productsToShow.push({
      series: "",
      name: "",
      description: "",
      images: [],
    })
  }

  return (
    <div className="product-slider-container">
      <div className="slider-header">
        <Link to="/allproducts">
        <h1 className="slider-title">All Products</h1>
        </Link>
        <div className="slider-controls">
         {currentCategory.name !== "All" && (
  <span className="slider-category">{currentCategory.name}</span>
)}
          <div className="slider-buttons">
            <button onClick={goToPrevCategory} aria-label="Previous category">
              <ChevronLeft />
            </button>
            <button onClick={goToNextCategory} aria-label="Next category">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      <hr className="slider-divider" />

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentCategoryIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="product-text">
            <h2 className="series">{productsToShow[0]?.series || ""}</h2>
            <h3 className="name">{productsToShow[0]?.name || ""}</h3>
            <div className="description">
              {(productsToShow[0]?.description || "").split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <button className="buy" onClick={() => handleBuyNow(productsToShow[0])} disabled={!productsToShow[0]?.name}>
              {isServiceCategory ? "Get a quote" : "Buy Now"}
            </button>
          </div>
          <div className="product-image">
            <img
              src={
                Array.isArray(productsToShow[0]?.images) && productsToShow[0]?.images.length > 0
                  ? productsToShow[0].images[0]
                  : "/placeholder.svg"
              }
              alt={productsToShow[0]?.name || "Product"}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="product-image">
            <img
              src={
                Array.isArray(productsToShow[1]?.images) && productsToShow[1]?.images.length > 0
                  ? productsToShow[1].images[0]
                  : "/placeholder.svg"
              }
              alt={productsToShow[1]?.name || "Product"}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="product-text">
            <h2 className="series">{productsToShow[1]?.series || ""}</h2>
            <h3 className="name">{productsToShow[1]?.name || ""}</h3>
            <div className="description">
              {(productsToShow[1]?.description || "").split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <button className="buy" onClick={() => handleBuyNow(productsToShow[1])} disabled={!productsToShow[1]?.name}>
              {isServiceCategory ? "Get a quote" : "Buy Now"}
            </button>
          </div>
          <div className="product-text">
            <h2 className="series">{productsToShow[2]?.series || ""}</h2>
            <h3 className="name">{productsToShow[2]?.name || ""}</h3>
            <div className="description">
              {(productsToShow[2]?.description || "").split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <button className="buy" onClick={() => handleBuyNow(productsToShow[2])} disabled={!productsToShow[2]?.name}>
              {isServiceCategory ? "Get a quote" : "Buy Now"}
            </button>
          </div>
          <div className="product-image">
            <img
              src={
                Array.isArray(productsToShow[2]?.images) && productsToShow[2]?.images.length > 0
                  ? productsToShow[2].images[0]
                  : "/placeholder.svg"
              }
              alt={productsToShow[2]?.name || "Product"}
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


