import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import App from "./App.tsx";
import "./index.css";
import { BranchProvider } from "./context/BranchProvider.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <ThemeInit />
          <App />
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

initThemeMode();
