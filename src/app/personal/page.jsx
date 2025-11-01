"use client";

import React, { useEffect, useState } from "react";
import "../../css/personal.scss";
import Gallery from "../gallery";

const images = [
  {
	  src: "https://www.dropbox.com/scl/fi/bwg7js8q1yqco5cr5r6g6/family.jpg?rlkey=y54laojb49i2idvk5opf4c04e&st=wbxalpa6&raw=1",
	  description: "Family",
  },
  {
	  src: "https://www.dropbox.com/scl/fi/wm0dtkjtgcxzoxgv4ic4n/life-is-tough-but-you-are-tougher.jpg?rlkey=xpnbc0qfvy7eps5rx659bw72k&st=5zre5231&raw=1",
	  description: "Life is tough but you are tougher",
  },
  {
	  src: "https://www.dropbox.com/scl/fi/ytestzahtvsur7byri1zd/halloween.jpg?rlkey=mra7nsi847s1kfcgvrdnpwr2d&st=3kxijojb&raw=1",
	  description: "Halloween",
  },
  {
	  src: "https://www.dropbox.com/scl/fi/2zs4fi797lrnh9lfppjfe/20210711-markville-grad.jpg?rlkey=opdmkxkckk9n3c6eebncmi6kb&st=0i4hw0wd&raw=1",
	  description: "Markville Graduation",
  },
  {
	  src: "https://www.dropbox.com/scl/fi/xifdktqk9ixj1erzzgduc/partner.jpg?rlkey=2xt3k2tjbio1v03zsszwqthk5&st=m7vav1ix&raw=1",
	  description: "SO",
  },
  {
    src: "https://www.dropbox.com/scl/fi/0kv43ijsl4i62yj7rd1ow/han-fu-pt2.jpg?rlkey=qgn6ryhuv41erbwgsqaugjuwo&st=j9di0hem&raw=1",
    description: "Han Fu Pt. 2",
  },
  {
    src: "https://www.dropbox.com/scl/fi/9806s9umcoja4o0coqajp/han-fu.jpg?rlkey=4yl5vc12drrq1z9f3jep5uy88&st=8dcw8t5v&raw=1",
    description: "Han Fu",
  }
];

export default function Personal() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <main className="Personal">
      <Gallery
        images={images}
        columns={1}
        isMobile={isMobile}
        renderHeader={() => (
		  <div className="gallery-header">
        <h1>Personal</h1>
        <p id="personal-text">♡</p>
		  </div>
  		)}
        renderItemInfo={null}
        navButtons={null}
        zoomLevel={4}
      />
    </main>
  );
}
