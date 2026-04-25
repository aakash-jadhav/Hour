import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { brandIconUrl } from "./brandIcon";
import "./styles.css";

(() => {
  let link = document.getElementById("app-brand-favicon") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "app-brand-favicon";
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
  }
  link.href = brandIconUrl;
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
