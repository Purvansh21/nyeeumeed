
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Declare the global window property for TypeScript
declare global {
  interface Window {
    openResourceSidebar?: () => void;
  }
}

// Make sure React is imported and available
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
