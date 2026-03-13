import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/global.css";
import "./styles/themes.css";

// Initialize university logo system with automatic setup
import logoHelper from "./utils/logoHelper";
import autoLogoSetup from "./utils/autoLogoSetup";
import logoUploader from "./utils/logoUploader";

// Auto-load logo on app startup with enhanced system
console.log('🎓 Initializing Haramaya University VMS...');

// Force upload logo from the specific path
logoUploader.uploadFromPath('/Haramaya-768x576.png').then(result => {
  if (result.success) {
    console.log('🎉 Haramaya University logo loaded successfully!');
  } else {
    console.log('⚠️ Using fallback logo system');
    // Fallback to the existing auto logo setup
    logoHelper.loadFromStorage();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);