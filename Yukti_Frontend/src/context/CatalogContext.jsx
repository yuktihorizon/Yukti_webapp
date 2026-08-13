import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CatalogContext = createContext(null);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let cachedCatalog = null;
let inflightCatalog = null;

async function requestCatalog() {
  const [catRes, prodRes] = await Promise.all([
    axios.get(`${API_BASE_URL}/category/getcategories`, { timeout: 15000 }),
    axios.get(`${API_BASE_URL}/products/getproducts`, { timeout: 15000 }),
  ]);

  return {
    categories: (catRes.data || []).filter((cat) => cat.name?.toLowerCase() !== "all"),
    products: Array.isArray(prodRes.data) ? prodRes.data : [],
  };
}

async function loadCatalog({ force = false } = {}) {
  if (!API_BASE_URL) {
    throw new Error("API is not configured");
  }

  if (!force && cachedCatalog) {
    return cachedCatalog;
  }

  if (!inflightCatalog) {
    inflightCatalog = (async () => {
      const MAX_RETRIES = 4;
      let lastError;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          cachedCatalog = await requestCatalog();
          return cachedCatalog;
        } catch (error) {
          lastError = error;
          if (attempt < MAX_RETRIES) {
            await sleep(500 * attempt);
          }
        }
      }
      throw lastError;
    })().finally(() => {
      inflightCatalog = null;
    });
  }

  return inflightCatalog;
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(cachedCatalog?.products || []);
  const [categories, setCategories] = useState(cachedCatalog?.categories || []);
  const [loading, setLoading] = useState(!cachedCatalog);
  const [error, setError] = useState(false);

  const fetchCatalog = useCallback(async (force = false) => {
    if (!cachedCatalog || force) setLoading(true);
    setError(false);
    try {
      const data = await loadCatalog({ force });
      setCategories(data.categories);
      setProducts(data.products);
      setError(false);
    } catch (err) {
      console.error("Failed to load catalog", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog(false);
  }, [fetchCatalog]);

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        refetch: () => fetchCatalog(true),
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return ctx;
}
