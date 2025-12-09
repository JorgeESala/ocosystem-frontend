import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import App from "./App.tsx";
import "./index.css";
import { BranchProvider } from "./context/BranchContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BranchProvider>
        <ThemeInit />
        <App />
      </BranchProvider>
    </AuthProvider>
  </StrictMode>,
);

initThemeMode();
