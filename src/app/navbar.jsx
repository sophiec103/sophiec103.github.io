"use client";

import { useState } from "react";
import "./../css/navbar.scss";
import { IconButton } from '@mui/material';
import { LuSun, LuMoon, LuMenu, LuX } from "react-icons/lu";
import { useDarkMode } from './useDarkMode';
import LogoSvg from "./logo";

export default function Navbar() {
  const [isLightMode, toggleDarkMode] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className={`navbar ${!isLightMode ? "dark" : ""}`}>
        <div className="left-section">
          <LogoSvg darkMode={!isLightMode} />
        </div>

        <div className="center-section desktop-only">
          <a href="/">Home</a>
          <a href="/photography">Photography</a>
        </div>

        <div className="right-section">
          <IconButton
            onClick={() => setMenuOpen(true)}
            className="hamburger mobile-only"
            color="inherit"
            aria-label="Open menu"
          >
            <LuMenu size={24} />
          </IconButton>

          <div className="desktop-only">
            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              aria-label="Toggle dark mode"
            >
              {isLightMode ? <LuSun /> : <LuMoon />}
            </IconButton>
          </div>
        </div>
      </nav>

      <div className={`side-menu ${menuOpen ? "open" : ""} ${!isLightMode ? "dark" : ""}`}>
        <div className="side-menu-header">
          <div className="side-menu-header-left">
            <button onClick={toggleDarkMode} className="toggle-btn" aria-label="Toggle dark mode" color="inherit">
              {isLightMode ? <LuSun size={20} /> : <LuMoon size={20} />}
            </button>
          </div>
          <IconButton
            onClick={() => setMenuOpen(false)}
            className="close-btn"
            color="inherit"
            aria-label="Close menu"
          >
            <LuX size={22} />
          </IconButton>
        </div>

        <div className="side-menu-items">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/photography" onClick={() => setMenuOpen(false)}>Photography</a>
        </div>
      </div>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
