"use client";

import "../../css/photography.scss";
import Gallery from "../../components/Gallery";
import { useDarkMode } from "../useDarkMode";
import { useState, useEffect, useMemo, useRef } from "react";

const numImages = 50;
const imagePaths = [];
for (let i = 1; i <= numImages; i++) {
  imagePaths.push(`/photos/${i}.jpg`);
}

const BATCH_SIZE = 10;

export default function Photography() {
  const [_isLightMode] = useDarkMode();
  const [flatImages, setFlatImages] = useState([]);
  const [columns, setColumns] = useState([[], [], []]);
  const [isMobile, setIsMobile] = useState(false);
  const [adventuresHighlighted, setAdventuresHighlighted] = useState(false);
  const ignoreNextClickRef = useRef(false);
  const pendingNavRef = useRef(null);

  const columnGroups = useMemo(() => [[41, 44]], []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBatch = async () => {
      const startIdx = flatImages.length;
      const endIdx = Math.min(startIdx + BATCH_SIZE, imagePaths.length);
      const batchPaths = imagePaths.slice(startIdx, endIdx);

      const loadedImages = await Promise.all(
        batchPaths.map((src) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
              resolve({
                src,
                alt: `Photo ${src.split("/").pop().split(".")[0]}`,
                width: img.naturalWidth,
                height: img.naturalHeight,
                ratio: img.naturalHeight / img.naturalWidth,
              });
            };
          });
        })
      );

      if (!isMounted) return;

      const newFlatImages = [...flatImages, ...loadedImages];

      // column balancing logic
      const colHeights = [0, 0, 0];
      const colImages = [[], [], []];
      const placed = new Set();

      for (let i = 0; i < newFlatImages.length; i++) {
        const imgNum = i + 1;
        if (placed.has(imgNum)) continue;

        const group = columnGroups.find((g) => g[0] === imgNum);
        if (group) {
          const minIndex = colHeights.indexOf(Math.min(...colHeights));
          for (const groupImgNum of group) {
            const imgIdx = groupImgNum - 1;
            if (newFlatImages[imgIdx]) {
              colImages[minIndex].push(newFlatImages[imgIdx]);
              colHeights[minIndex] += newFlatImages[imgIdx].ratio;
              placed.add(groupImgNum);
            }
          }
        } else {
          const minIndex = colHeights.indexOf(Math.min(...colHeights));
          colImages[minIndex].push(newFlatImages[i]);
          colHeights[minIndex] += newFlatImages[i].ratio;
          placed.add(imgNum);
        }
      }

      setFlatImages(newFlatImages);
      setColumns(colImages);

      // batch loading
      if (endIdx < imagePaths.length) {
        setTimeout(loadBatch, 50);
      }
    };

    if (flatImages.length < imagePaths.length) {
      loadBatch();
    }

    return () => {
      isMounted = false;
    };
  }, [flatImages, columnGroups]);

  const galleryImages = isMobile
    ? flatImages
    : columns.flat();

  const galleryColumns = isMobile ? [galleryImages] : columns;

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      setAdventuresHighlighted(
        selection && selection.toString().trim().includes("adventures")
      );
    };
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, []);

  const handleAdventuresClick = (e) => {
    const selection = window.getSelection();
    const isHighlightedNow =
      adventuresHighlighted ||
      (selection && selection.toString().trim().includes("adventures"));

    if (!isHighlightedNow) {
      return;
    }

    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current);
      pendingNavRef.current = null;
    }

    pendingNavRef.current = window.setTimeout(() => {
      pendingNavRef.current = null;

      if (ignoreNextClickRef.current) {
        ignoreNextClickRef.current = false;
        return;
      }

      const sel = window.getSelection();
      const stillHighlighted =
        adventuresHighlighted ||
        (sel && sel.toString().trim().includes("adventures"));

      if (stillHighlighted) {
        window.location.href = "/adventures";
      }
    }, 250);
  };

  const handleAdventuresDoubleClick = (e) => {
    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current);
      pendingNavRef.current = null;
    }
    ignoreNextClickRef.current = true;
  };

  useEffect(() => {
    return () => {
      if (pendingNavRef.current) {
        clearTimeout(pendingNavRef.current);
        pendingNavRef.current = null;
      }
    };
  }, []);

  return (
    <main className="Photography">
      <Gallery
        images={galleryImages}
        columns={isMobile ? 1 : 3}
        isMobile={isMobile}
        renderHeader={() => (
          <div className="gallery-header">
            <h1>Photography</h1>
            <p
              id="adventures-text"
              style={{ display: "inline" }}
            >
              Captured moments from my{" "}
              <span
                style={{
                  cursor: adventuresHighlighted ? "pointer" : "auto",
                  textDecoration: adventuresHighlighted ? "underline" : "none",
                  transition: "text-decoration 0.2s",
                }}
                onClick={handleAdventuresClick}
                onDoubleClick={handleAdventuresDoubleClick}
              >
                adventures
              </span>
            </p>
          </div>
        )}
        renderItemInfo={null}
        customColumns={galleryColumns}
      />
    </main>
  );
}
