import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import tema from "./tema/tema";
import "./style.css";

ReactDOM.createRoot(document.querySelector("#app")).render(
  <React.StrictMode>
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
