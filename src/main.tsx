import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AdminProvider } from "./contexts/AdminContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <LanguageProvider>
      <CartProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </CartProvider>
    </LanguageProvider>
  </ThemeProvider>,
);
