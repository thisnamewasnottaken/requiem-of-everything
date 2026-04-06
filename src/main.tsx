import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./App";
import "./styles/global.css";
import "./styles/walkthrough.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{ background: '#0a0a0f', minHeight: '100vh' }} />}>
      <App />
    </Suspense>
  </React.StrictMode>,
);
