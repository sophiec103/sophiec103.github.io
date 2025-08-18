import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isLightMode, setIsLightMode] = useState(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      const stored = localStorage.getItem("isLightMode");
      if (stored !== null) return stored === "true";
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return !prefersDark;
    }
    return true;
  });

  useEffect(() => {
    const mode = isLightMode ? "light" : "dark";
    document.body.setAttribute("data-theme", mode);
    localStorage.setItem("isLightMode", isLightMode);
  }, [isLightMode]);

  const toggleDarkMode = () => {
    setIsLightMode(prevMode => !prevMode);
    document.body.classList.toggle('dark-mode');
  };

  return [isLightMode, toggleDarkMode];
}