import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useCatalog } from "../context/CatalogContext"
import { isCustomCraftProduct } from "../utils/product"
import "../styles/Homeproducts.css"

function ProductBlock({ product, index, isServiceCategory, onBuyNow }) {
  const textFirst = index % 2 === 0
  const imageSrc =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : "/placeholder.svg"

  return (
    <article
      className={`product-card ${textFirst ? "product-card--text-first" : "product-card--image-first"}`}
    >
      <div className="product-image">
        <img src={imageSrc} alt={product.name} />
      </div>
      <div className="product-text">
        {product.series && <h2 className="series">{product.series}</h2>}
        <h3 className="name">{product.name}</h3>
        {product.description && (
          <div className="description">
            {product.description.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
        <button className="buy" onClick={() => onBuyNow(product)}>
          {isServiceCategory ? "Get a quote" : isCustomCraftProduct(product) ? "Enquire" : "Buy Now"}
        </button>
      </div>
    </article>
  )
}

export default function ProductSlider() {
  const { products, categories: categoriesFromAPI, loading, error: fetchError, refetch } = useCatalog()
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const navigate = useNavigate()

  const categories = useMemo(() => {
    const consumerProducts = products.filter((product) => {
      const mainCat = product.category?.mainCategory
      return !mainCat || mainCat === "Consumer Products"
    })

    const catMap = categoriesFromAPI
      .filter((cat) => cat.mainCategory === "Consumer Products" || !cat.mainCategory)
      .reduce((acc, cat) => {
        acc[cat._id] = { id: cat._id, name: cat.name, products: [] }
        return acc
      }, {})

    consumerProducts.forEach((product) => {
      const catId = product.category?._id || product.category
      if (catMap[catId]) {
        catMap[catId].products.push(product)
      }
    })

    const sortByHomeOrder = (a, b) => {
      const orderA = a.homeOrder > 0 ? a.homeOrder : Number.POSITIVE_INFINITY
      const orderB = b.homeOrder > 0 ? b.homeOrder : Number.POSITIVE_INFINITY
      if (orderA !== orderB) return orderA - orderB
      return String(a.name || "").localeCompare(String(b.name || ""))
    }

    return Object.values(catMap)
      .map((cat) => ({
        ...cat,
        products: [...cat.products].sort(sortByHomeOrder),
      }))
      .filter((cat) => cat.products.length > 0)
  }, [products, categoriesFromAPI])

  const currentCategory = categories[currentCategoryIndex] || { name: "", products: [] }
  const isServiceCategory =
    currentCategory.name?.toLowerCase() === "service" ||
    currentCategory.name?.toLowerCase().includes("service")

  const goToNextCategory = () => {
    if (categories.length <= 1) return
    setDirection(1)
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length)
  }

  const goToPrevCategory = () => {
    if (categories.length <= 1) return
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
    enter: (dir) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0 }),
  }

  if (loading) {
    return <div className="product-slider-container">Loading products...</div>
  }

  if (fetchError) {
    return (
      <div className="product-slider-container">
        <p>Unable to load products right now.</p>
        <button type="button" className="buy" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  const productsToShow = currentCategory.products.slice(0, 3)

  return (
    <div className="product-slider-container">
      <div className="slider-header">
        <Link to="/allproducts">
          <h1 className="slider-title">Consumer Products</h1>
        </Link>
        <div className="slider-controls">
          {currentCategory.name !== "All" && (
            <span className="slider-category">{currentCategory.name}</span>
          )}
          {categories.length > 1 && (
            <div className="slider-buttons">
              <button onClick={goToPrevCategory} aria-label="Previous category">
                <ChevronLeft />
              </button>
              <button onClick={goToNextCategory} aria-label="Next category">
                <ChevronRight />
              </button>
            </div>
          )}
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
          className={`product-slider-grid product-slider-grid--count-${productsToShow.length}`}
        >
          {productsToShow.map((product, index) => (
            <ProductBlock
              key={product._id}
              product={product}
              index={index}
              isServiceCategory={isServiceCategory}
              onBuyNow={handleBuyNow}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
