"use client";

import "./../css/home.scss";
import { Encode_Sans_Semi_Expanded } from "next/font/google";
import { FaGithub, FaLinkedin, FaFileLines } from "react-icons/fa6";
import { useDarkMode } from './useDarkMode';

const encode = Encode_Sans_Semi_Expanded({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Home() {
  const [isLightMode] = useDarkMode();

  return (
    <main className="Home">
      <div className="content-wrapper">
        <div className={`icon-wrapper ${isLightMode ? '' : 'dark-mode'}`}>
          <a href="https://github.com/sophiec103"><FaGithub size={'1.1em'}/> </a>
          <a href="#"><FaFileLines size={'1.1em'} /> </a>
          <a href="https://www.linkedin.com/in/s94chan/"><FaLinkedin  size={'1.1em'}/> </a>
        </div>
        <div className="text-wrapper">
          <h2 className="greeting">Hello!</h2>
          <h1 className={`name ${encode.className}`}>I&apos;m Sophie Chan</h1>
          <p className="description">
            I&apos;m currently studying Computer Science at the University of
            Waterloo. I&apos;ve had some great experiences working at
            <a href="https://www.faire.com/"> Faire</a>,
            <a href="https://charitycan.ca/"> CharityCAN</a>,
            <a href="https://adentro.com/"> Adentro</a>, and
            <a href="https://atomic.vc/"> Atomic VC</a>. I&apos;m seeking Fall
            2024 internship opportunities, and I look forward to making an
            impact wherever I go next!
          </p>
        </div>
          {/* <img
            src="https://cdn3.emoji.gg/emojis/8771_blobheart.png"
            width="30px"
            height="30px"
            alt="blobheart"
          /> */}
        <img src="/sophie.png" alt="Sophie profile picture" className="profile-picture" />
      </div>
    </main>
  );
}
