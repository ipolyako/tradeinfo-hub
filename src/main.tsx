
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure the DOM is ready before rendering
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

// Add error handling for the root render
try {
  const root = createRoot(container);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  // Fallback rendering
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center; padding: 20px;">
        <h2>Loading Error</h2>
        <p>Please refresh the page to try again.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh
        </button>
      </div>
    </div>
  `;
}
