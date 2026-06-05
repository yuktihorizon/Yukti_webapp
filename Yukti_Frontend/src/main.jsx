import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./styles/global.css";
import { CartProvider } from "./pages/CartContext";
import { SearchProvider } from "./components/SearchContext"; // <-- Import here

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SearchProvider> {/* Wrap SearchProvider */}
        <CartProvider>
          <App />
        </CartProvider>
      </SearchProvider>
    </BrowserRouter>
  </StrictMode>
);
