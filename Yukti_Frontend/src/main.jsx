import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./styles/global.css";
import { CartProvider } from "./pages/CartContext";
import { CatalogProvider } from "./context/CatalogContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <CatalogProvider>
          <App />
        </CatalogProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
