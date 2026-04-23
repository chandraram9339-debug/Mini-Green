import React from "react";
import { createRoot } from "react-dom/client";
import App from "./fm/App";
import { applyBalanceQueryFromUrl } from "./fm/figma/mockBalances";
import { initTelegramWebApp } from "./fm/telegram/initTelegramWebApp";
import { initFmThemeFromStorage } from "./fm/theme/fmTheme";
import "./fm/index.css";

applyBalanceQueryFromUrl();
initFmThemeFromStorage();
initTelegramWebApp();

document.title = "Palladium";
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
