import Image from "next/image";
import "./../css/home.scss";
import { Encode_Sans_Semi_Expanded } from "next/font/google";

const encode = Encode_Sans_Semi_Expanded({ subsets: ["latin"], weight: ["600"] });

export default function Home() {
  return (
    <main className="Home">
      <div className="content-wrapper">
        <div className="text-wrapper">
          <h2 className="greeting">Hello!</h2>
          <h1 className={`name ${encode.className}`}>I'm Sophie Chan</h1>
          <p className="description">
            I'm currently studying Computer Science at the University of Waterloo, with an anticipated graduation in 2026.
            I've had some great experiences working at Faire, CharityCAN, Adentro, and Atomic VC. 
            I'm in the process of seeking internship opportunities for the Fall 2024 term.
          </p>
        </div>
        {/* <a href="https://emoji.gg/emoji/8771_blobheart">
          <img
            src="https://cdn3.emoji.gg/emojis/8771_blobheart.png"
            width="64px"
            height="64px"
            alt="blobheart"
          />
        </a> */}
        <img src="/sophie.png" alt="Sophie profile picture" className="profile-picture"/>
      </div>
    </main>
  );
}
