"use client";

import "./../css/home.scss";
import { Encode_Sans_Semi_Expanded } from "next/font/google";
import { FaGithub, FaLinkedin, FaFileLines } from "react-icons/fa6";
import { useDarkMode } from './useDarkMode';
import { TypeAnimation } from 'react-type-animation';
import React, { useState, useRef } from "react";

const encode = Encode_Sans_Semi_Expanded({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Home() {
  const [isLightMode] = useDarkMode();
  const titles = [
    "Sophie Chan",
    2000,
    "a Software Engineer",
    1500,
    "a CS Student",
    1500,
    "a Problem Solver",
    1500,
    "a Photographer",
    1500,
    "an Explorer",
    1500,
    "Chinese Canadian",
    1500,
    "excited to connect!",
    1500,
  ];

  const [armed, setArmed] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const armTimeout = useRef(null);

  const imageCount = 14;
  const images = Array.from({ length: imageCount }, (_, i) =>
    i === 0 ? "/sophie.jpg" : `/sophie${i}.jpg`
  );

  const handleImgClick = () => {
    if (!armed) {
      setArmed(true);
      armTimeout.current = setTimeout(() => setArmed(false), 1000);
    } else {
      setImgIndex((prev) => (prev + 1) % images.length);
      setArmed(false);
      clearTimeout(armTimeout.current);
    }
  };

  React.useEffect(() => {
    return () => clearTimeout(armTimeout.current);
  }, []);

  const cursorStyle = armed ? "pointer" : "default";

  return (
    <main className="Home">
      <div className="content-wrapper">
        <div className={`icon-wrapper ${isLightMode ? '' : 'dark-mode'}`}>
          <a href="https://github.com/sophiec103"><FaGithub size={'1.25em'}/> </a>
          <a href="https://drive.google.com/file/d/1d9qqxCgIDhERyow4oegd2uBBidDBf6ar/view"><FaFileLines size={'1.25em'} /> </a>
          <a href="https://www.linkedin.com/in/s94chan/"><FaLinkedin  size={'1.25em'}/> </a>
        </div>
        <div className="text-wrapper">
          <h2 className="greeting">Hello!</h2>
          <h1 className={`name ${encode.className}`}>
            I&apos;m&nbsp;
            <TypeAnimation
              sequence={titles}
              speed={50}
              repeat={Infinity}
              cursor={true}
            />
          </h1>
          <p className="description">
            I&apos;m currently studying Computer Science at the University of
            Waterloo. I&apos;ve had some really great experiences working at
            <a href="https://www.uber.com/"> Uber</a>,
            <a href="https://www.databricks.com/"> Databricks</a>,
            <a href="https://www.spscommerce.com/"> SPS Commerce</a>,
            <a href="https://www.faire.com/"> Faire</a>,
            <a href="https://charitycan.ca/"> CharityCAN</a>,
            <a href="https://adentro.com/"> Adentro</a>, and
            <a href="https://atomic.vc/"> Atomic VC</a>. I&apos;m seeking 2026 new grad opportunities, and I look forward to making an
            impact wherever I go next!
          </p>
        </div>
          {/* <img
            src="https://cdn3.emoji.gg/emojis/8771_blobheart.png"
            width="30px"
            height="30px"
            alt="blobheart"
          /> */}
        <img
          src={images[imgIndex]}
          alt="Sophie profile picture"
          className="profile-picture"
          style={{ cursor: cursorStyle }}
          onClick={handleImgClick}
        />
      </div>
    </main>
  );
}
