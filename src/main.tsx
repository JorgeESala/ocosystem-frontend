import { initThemeMode } from "flowbite-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeInit } from "../.flowbite-react/init";
import App from "./App.tsx";
import "./index.css";
import { BranchProvider } from "./context/BranchContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BranchProvider>
      <ThemeInit />
      <App />
    </BranchProvider>
  </StrictMode>,
);

initThemeMode();
