"use client";

import "../../css/photography.scss";
import { useDarkMode } from "../useDarkMode";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const numImages = 47;
const imagePaths = [];
for (let i = 1; i <= numImages; i++) {
  imagePaths.push(`/photos/${i}.jpg`);
}

const BATCH_SIZE = 10;

export default function Photography() {
  const [_isLightMode] = useDarkMode();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [columns, setColumns] = useState([[], [], []]);
  const [flatImages, setFlatImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

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
        setTimeout(loadBatch, 300);
      }
    };

    if (flatImages.length < imagePaths.length) {
      loadBatch();
    }

    return () => {
      isMounted = false;
    };
  }, [flatImages, columnGroups]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex !== null) {
        if (e.key === "Escape") {
          setSelectedIndex(null);
        } else if (e.key === "ArrowLeft") {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "ArrowRight") {
          setSelectedIndex((prev) =>
            prev < flatImages.length - 1 ? prev + 1 : prev
          );
        }
      }
    };

    if (selectedIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, flatImages.length]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1); // swipe right
      } else if (diff < 0 && selectedIndex < flatImages.length - 1) {
        setSelectedIndex(selectedIndex + 1); // swipe left
      }
    }
    setTouchStartX(null);
  };

  return (
    <main className="Photography">
      <div className="gallery-header">
        <h1>Photography</h1>
        <p>Captured moments from my adventures</p>
      </div>

      {flatImages.length > 0 ? (
        <div className="gallery-container">
          {isMobile ? (
            // photos in chronological order (single column)
            <div className="gallery-column">
              {flatImages.map((image, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    style={{ width: "100%", height: "auto", display: "block" }}
                    unoptimized={true}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            // photos balanced by height and chronological order (three columns)
            <div className="gallery-columns">
              {columns.map((column, colIndex) => (
                <div key={colIndex} className="gallery-column">
                  {column.map((image, index) => {
                    const flatIndex = flatImages.findIndex(
                      (img) => img.src === image.src
                    );
                    return (
                      <div
                        key={index}
                        className="gallery-item"
                        onClick={() => setSelectedIndex(flatIndex)}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={image.width}
                          height={image.height}
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                          unoptimized={true}
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="loading">Loading images...</div>
      )}

      {selectedIndex !== null && flatImages[selectedIndex] && (
        <div
          className="image-modal"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-content">
            <img
              src={flatImages[selectedIndex].src}
              alt={flatImages[selectedIndex].alt}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
