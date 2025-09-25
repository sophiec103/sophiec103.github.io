"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Gallery({
  images,
  columns = 3,
  renderHeader,
  renderItemInfo,
  navButtons,
  isMobile,
  customColumns,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex !== null) {
        if (e.key === "Escape") {
          setSelectedIndex(null);
        } else if (e.key === "ArrowLeft") {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "ArrowRight") {
          setSelectedIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : prev
          );
        }
      }
    };
    if (selectedIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length]);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (diff < 0 && selectedIndex < images.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    }
    setTouchStartX(null);
  };

  // Use customColumns if provided, else split images evenly
  const colArr = customColumns
    ? customColumns
    : Array.from({ length: columns }, () => []);
  if (!customColumns) {
    images.forEach((img, idx) => {
      colArr[idx % columns].push({ ...img, globalIndex: idx });
    });
  }

  const flatImages = customColumns ? customColumns.flat() : images;

  return (
    <main className="Gallery">
      {renderHeader && renderHeader()}
      {navButtons}
      <div
        className="gallery-columns"
        style={{
          maxWidth: "1200px",
          margin: "48px auto 0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : `repeat(${columns}, 1fr)`,
          gap: "32px",
        }}
      >
        {colArr.map((column, colIdx) => (
          <div key={colIdx} className="gallery-column">
            {column.map((img, idx) => {
              const globalIndex = flatImages.indexOf(img);
              return (
                <div
                  key={globalIndex}
                  className="gallery-item"
                  style={{ marginBottom: "48px", cursor: "pointer" }}
                  onClick={() => setSelectedIndex(globalIndex)}
                >
                  {renderItemInfo && renderItemInfo(img)}
                  <Image
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                    unoptimized
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {selectedIndex !== null && flatImages[selectedIndex] && (
        <div
          className="image-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIndex(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-content">
            <img
              src={flatImages[selectedIndex].src}
              alt={flatImages[selectedIndex].alt || flatImages[selectedIndex].title || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                marginBottom: "16px",
                display: "block",
              }}
            />
            {renderItemInfo && renderItemInfo(flatImages[selectedIndex])}
          </div>
        </div>
      )}
    </main>
  );
}