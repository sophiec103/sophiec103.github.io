import { useState, useEffect } from 'react';

export function useDarkMode() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isLightMode, setIsLightMode] = useState(!prefersDark);

  useEffect(() => {
    const mode = isLightMode ? "light" : "dark";
    document.body.setAttribute("data-theme", mode);
  }, [isLightMode]);

  const toggleDarkMode = () => {
    setIsLightMode(prevMode => !prevMode);
    document.body.classList.toggle('dark-mode');
  };

  return [isLightMode, toggleDarkMode];
}