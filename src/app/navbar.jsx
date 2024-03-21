"use client"; // This is a client component

import { useState } from "react";
import "./../css/navbar.scss";
import { IconButton } from '@mui/material';


export default function Navbar(className) {

  // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [isLightMode, setIsLightMode] = useState(true);

  return (
    <nav className={className}>
      <div className="left-section">SC</div>
      <div className="right-section">
        <IconButton
          color="inherit"
          onClick={() => {
            console.log("HERE", isLightMode)
            if (isLightMode) {
              document.html.classList.remove('dark');
            } else {
              document.html.classList.add('dark');
            }
            setIsLightMode(!isLightMode)
          }}
          aria-label="Dark mode toggle"
        >
          {isLightMode ? "🌞" : "🌚"}
        </IconButton>
      </div>
    </nav>
  );
}


