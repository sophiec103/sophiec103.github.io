"use client";

import "../../css/adventures.scss";
import { useState, useEffect, useRef } from "react";
import Gallery from "../gallery";

const adventures = [
  {
	src: "https://www.dropbox.com/scl/fi/pibth1anm83qhmwj1ra27/20190627-sault-ste-marie.jpg?rlkey=ifgghfmtmt6976iwmpx9vy9np&st=jf16oobs&raw=1",
	title: "Sault Ste. Marie",
	date: "2019-06-27",
  },
  {
	src: "https://www.dropbox.com/scl/fi/0jffjdgf7luu0tgokbhjm/20191013-ripley.jpg?rlkey=fl6t04367kbgar1dk80kh2sv8&st=as5w27is&raw=1",
	title: "Ripley's Aquarium",
	date: "2019-10-13",
  },
  {
	src: "https://www.dropbox.com/scl/fi/6uvbhkqmuik3rxaib59pn/20191222-disney-world.jpg?rlkey=x3jjdbj2uwkjl5ockm9l97xy6&st=ugpozkk7&raw=1",
	title: "Disney World",
	date: "2019-12-22",
  },
  {
	src: "https://www.dropbox.com/scl/fi/nfgnl1xgghhzxuko7o7uc/20200221-tolightfest.jpg?rlkey=boq975p2u049ls59a144b0dr7&st=wnuz04cq&raw=1",
	title: "Toronto Light Festival",
	date: "2020-02-21",
  },
  {
	src: "https://www.dropbox.com/scl/fi/2ajjyf1bphon8gz33067d/20220612-miami-first-co-op.jpg?rlkey=h6yronklfiwi23bjdtd0kl4re&st=3t93peay&raw=1",
	title: "Miami (First Co-op)",
	date: "2022-06-12",
  },
  {
	src: "https://www.dropbox.com/scl/fi/b5au9gpx83zgtbd1f4i4a/20230828-tobermory.jpg?rlkey=vd1e9ntsfkh7l26to9l8ev3b1&st=ngn2o0vi&raw=1",
	title: "Tobermory",
	date: "2023-08-28",
  },
  {
	src: "https://www.dropbox.com/scl/fi/8qf4wf48xr542mrqmyj4x/20231009-new-york.jpg?rlkey=g6oi76jhd47idco9y2la8gizx&st=w1324qre&raw=1",
	title: "New York",
	date: "2023-10-09",
  },
  {
	src: "https://www.dropbox.com/scl/fi/16vm9mp0pq9f2m7xltn81/20231220-kwfamous-holiday-pop-up.jpg?rlkey=54gs6mewp93ikdvy02bl1xkgk&st=12tcpedk&raw=1",
	title: "KWFamous Holiday Pop-Up",
	date: "2023-12-20",
  },
  {
	src: "https://www.dropbox.com/scl/fi/elp6moegn0sx8ehdf3cbe/20240427-hong-kong.jpg?rlkey=lb1hx02klwce3edfwb16wjtey&st=si2q2iyv&raw=1",
	title: "Hong Kong + Taiwan",
	date: "2024-04-27",
  },
  {
	src: "https://www.dropbox.com/scl/fi/y5yitxoyk4sbrmxcgcl4w/20240815-seattle.jpg?rlkey=nxeiagcw0dyz7awf05naxtusg&st=0zx6zvpd&raw=1",
	title: "Seattle",
	date: "2024-08-15",
  },
  {
	src: "https://www.dropbox.com/scl/fi/bc13y2sr5ndncui7n7yrr/20240826-miami.jpg?rlkey=scxk9ide5lprylf0u58p5cmcp&st=x5kpp76h&raw=1",
	title: "Miami",
	date: "2024-08-26",
  },
  {
	src: "https://www.dropbox.com/scl/fi/elaxrtobird4qg887wwjv/20241027-markham-claw-n-kitty.jpg?rlkey=xqhr3lq99fhpwgygqiwbtgezw&st=yo4uk5tb&raw=1",
	title: "Markham Claw&Kitty",
	date: "2024-10-27",
  },
  {
	src: "https://www.dropbox.com/scl/fi/k685itu9gvscdiwaw8b2n/20241101-new-york-pre-christmas.jpg?rlkey=lipeez60cgxgpatnbjkhtnorc&st=uosxqe5o&raw=1",
	title: "New York Pre-Christmas",
	date: "2024-11-01",
  },
  {
	src: "https://www.dropbox.com/scl/fi/wsak3gjz6f69ckzmgkclp/20241116-toronto-christmas.jpg?rlkey=dylwd5jp36nn21vjd1rotm6of&st=b4xze7t4&raw=1",
	title: "Toronto Christmas",
	date: "2024-11-16",
  },
  {
	src: "https://www.dropbox.com/scl/fi/o5pgrkp7a0kmdqmpu001l/20241130-new-york-christmas.jpg?rlkey=ctd1v6vjt0hmw5mk5iw01q7ha&st=15vvsq34&raw=1",
	title: "New York Christmas",
	date: "2024-11-30",
  },
  {
	src: "https://www.dropbox.com/scl/fi/jxx1q5d2jv2414jljeo8w/20250103-disney-world.jpg?rlkey=77zudkcaedk6iq3afbjlp6d9t&st=g4x5ty1e&raw=1",
	title: "Disney World",
	date: "2025-01-03",
  },
  {
	src: "https://www.dropbox.com/scl/fi/s465ggtpfbs7dhrs4v7f3/20250106-disney-cruise.jpg?rlkey=964w0gpdu8i0puiopnbxnqtlh&st=oz4fm34a&raw=1",
	title: "Disney Wish Cruise",
	date: "2025-01-06",
  },
  {
	src: "https://www.dropbox.com/scl/fi/nhf0hz5u1fc5pj5jvbtxr/20250429-las-vegas.jpg?rlkey=waqapwznq1ij3zs5u8jfynhdp&st=0rd3o855&raw=1",
	title: "Las Vegas",
	date: "2025-05-05",
  },
  {
	src: "https://www.dropbox.com/scl/fi/x617wg0ctygookg0ahwsk/20250430-zion-grand-canyon.jpg?rlkey=q0h2j0vuwkkyy7dm28fle1gq4&st=93en2ym7&raw=1",
	title: "Zion + Grand Canyon",
	date: "2025-05-05",
  },
  {
	src: "https://www.dropbox.com/scl/fi/vcm9r198yor48m6bkxivs/20250505-cali-summer.jpg?rlkey=unkg1spndse5vr3lgdutu9xz2&st=aulw4wjw&raw=1",
	title: "California Summer",
	date: "2025-05-05",
  },
  {
	src: "https://www.dropbox.com/scl/fi/rsn9w4vizaaf8zb3sqfp3/20250618-sf-visit.jpg?rlkey=f6mclf75lc4jrz7sce5z9wa07&st=hdv131bt&raw=1",
	title: "San Francisco Visit",
	date: "2025-06-18",
  },
  {
	src: "https://www.dropbox.com/scl/fi/otpsa9gdg7aeiyhp3b6pk/20250801-new-york-summer.jpg?rlkey=ll9stqbvh4cravuq6qawqo6ps&st=8bauf9zt&raw=1",
	title: "New York Summer",
	date: "2025-08-01",
  },
  {
	src: "https://www.dropbox.com/scl/fi/n5phhe6ap4lrsvjkav3o4/20250813-mtv-sf-visit.jpg?rlkey=v4ddnjctroc4bbjn7d4cznd0p&st=lfe4dip8&raw=1",
	title: "Mountain View + SF Visit",
	date: "2025-08-13",
  },
  {
	src: "https://www.dropbox.com/scl/fi/ac8eki3q1gq7fcvnvk2yb/20250826-iceland.jpg?rlkey=lrj5yxx6f0xk8m2qcmujtzkxq&st=w2y49gyd&raw=1",
	title: "Iceland",
	date: "2025-08-26",
  },
  {
	src: "https://www.dropbox.com/scl/fi/igtf4b5b78gwxogp4z9wh/20250906-cali-autumn.jpg?rlkey=g4bqun80lvku4vzkmgws38tnc&st=g2o83w3g&raw=1",
	title: "California Autumn",
	date: "2025-09-06",
  },
  {
	src: "https://www.dropbox.com/scl/fi/jjls1dqmlejtzwjuav576/20251203-finland.jpg?rlkey=wi5dfw42qcg04zmpa78129wix&st=1ptzaxpq&raw=1",
	title: "Finland",
	date: "2025-12-03",
  },
];

export default function Adventures() {
  const [isMobile, setIsMobile] = useState(false);
  const [meHighlighted, setMeHighlighted] = useState(false);

  const pendingNavRef = useRef(null);
  const lastHighlightTimeRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";
      setMeHighlighted(text === "me");
      if (text === "me") {
        lastHighlightTimeRef.current = Date.now();
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("selectionchange", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  const handleIClick = (e) => {
    if (!meHighlighted) return;
    e.preventDefault();

    if (pendingNavRef.current) clearTimeout(pendingNavRef.current);
    pendingNavRef.current = setTimeout(() => {
      window.location.href = "/personal";
    }, 100);
  };

  const renderHeader = () => (
    <div className="gallery-header">
      <h1>Adventures</h1>
      <p className="memories-text">
        A collection of{" "}
        <span id="me">me</span>mor<span
          id="i"
          className={meHighlighted ? "active" : ""}
          role="link"
          tabIndex={0}
          onMouseDown={handleIClick}
          onTouchStart={handleIClick}
        >
          i
        </span>es and stories
      </p>
    </div>
  );

  const navButtons = !isMobile ? (
    <nav className="sticky-nav">
      <div className="nav-buttons">
        {adventures.map((adv, idx) => (
          <button
            key={idx}
            onClick={() => {
              const el = document.getElementById(`adventure-${idx}`);
              if (el) {
                const yOffset = -20;
                const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {adv.title}
          </button>
        ))}
      </div>
    </nav>
  ) : null;

  const renderItemInfo = (item, idx) => (
    <div className="item-title" id={`adventure-${idx}`}>
      {item.date} - {item.title}
    </div>
  );

  const renderModalInfo = (item) => (
    <div>
      <strong>{item.date}</strong> - {item.title}
    </div>
  );

  return (
    <main className="Adventures">
      <Gallery
        images={adventures}
        columns={isMobile ? 1 : 3}
        isMobile={isMobile}
        renderHeader={renderHeader}
        renderItemInfo={renderItemInfo}
        renderModalInfo={renderModalInfo}
        navButtons={navButtons}
        customColumns={null}
        zoomLevel={4}
		withItemIds
      />
    </main>
  );
}