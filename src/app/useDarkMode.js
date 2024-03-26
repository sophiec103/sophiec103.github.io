import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isLightMode, setIsLightMode] = useState(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return !prefersDark;
    }
    return true;
  });

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