
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// iOS viewport height fix
function setVhUnit() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setVhUnit();

// Re-calculate on resize and orientation change
window.addEventListener('resize', setVhUnit);
window.addEventListener('orientationchange', setVhUnit);

// Force Safari to recalculate layout on load
window.addEventListener('load', () => {
  setTimeout(setVhUnit, 100);
});

createRoot(document.getElementById("root")!).render(<App />);
