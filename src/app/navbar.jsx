"use client"; // This is a client component

import { useState, useEffect } from "react";
import "./../css/navbar.scss";
import { IconButton } from '@mui/material';
import { LuSun, LuMoon } from "react-icons/lu";
import { useDarkMode } from './useDarkMode';

export default function Navbar(className) {
  const [isLightMode, toggleDarkMode] = useDarkMode();

  return (
    <nav className={className}>
      <div className="left-section">
        <img src="/logo.svg" alt="Sophie logo" />
      </div>
      <div className="right-section">
        <IconButton
          color="inherit"
          onClick={toggleDarkMode}
          aria-label="Dark mode toggle"
        >
          {isLightMode ? <LuSun /> : <LuMoon />}
        </IconButton>
      </div>
    </nav>
  );
}
