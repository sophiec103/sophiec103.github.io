"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export default function Gallery({
  images = [],
  columns = 3,
  renderHeader,
  renderItemInfo,
  renderModalInfo,
  navButtons,
  isMobile = false,
  customColumns = null,
  withItemIds = false,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const touchStartXRef = useRef(null);

  const sourceFlat = useMemo(() => {
    if (images && images.length) return images;
    if (customColumns && customColumns.length) return customColumns.flat();
    return [];
  }, [images, customColumns]);

  // attach stable globalIndex for modal ordering
  const enrichedFlat = useMemo(
    () => sourceFlat.map((it, idx) => ({ ...it, globalIndex: idx })),
    [sourceFlat]
  );

  // quick lookup map keyed by `src||alt` to the enriched item
  const enrichedByKey = useMemo(() => {
    const map = new Map();
    for (const e of enrichedFlat) {
      const key = `${e.src}||${e.alt || ""}`;
      map.set(key, e);
    }
    return map;
  }, [enrichedFlat]);

  const getEnrichedFor = (item) => {
    if (!item) return null;
    const key = `${item.src}||${item.alt || ""}`;
    if (enrichedByKey.has(key)) return enrichedByKey.get(key);

    const found = enrichedFlat.find((f) => f.src === item.src || (item.alt && f.alt === item.alt));
    if (found) return found;

    return { ...item, globalIndex: enrichedFlat.length };
  };

  const colArr = useMemo(() => {
    if (customColumns && Array.isArray(customColumns)) {
      return customColumns.map((col) => col.map((it) => getEnrichedFor(it)));
    } else {
      const arr = Array.from({ length: Math.max(1, columns) }, () => []);
      enrichedFlat.forEach((item, idx) => {
        arr[idx % arr.length].push(item);
      });
      return arr;
    }
  }, [customColumns, enrichedFlat, columns]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev < enrichedFlat.length - 1 ? prev + 1 : prev
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, enrichedFlat.length]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches && e.touches[0] && e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start == null) return;
    const end = e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX;
    if (end == null) return;
    const diff = end - start;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else {
        setSelectedIndex((prev) =>
          prev < enrichedFlat.length - 1 ? prev + 1 : prev
        );
      }
    }
  };

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
          gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.max(1, columns)}, 1fr)`,
          gap: "32px",
        }}
      >
        {colArr.map((column, colIdx) => (
          <div key={colIdx} className="gallery-column">
            {column.map((img) => {
              const globalIndex = img?.globalIndex ?? 0;
              return (
                <div
                  key={globalIndex}
                  className="gallery-item"
                  id={withItemIds ? `adventure-${globalIndex}` : undefined}
                  style={{ marginBottom: "48px" }}
                >
                  {renderItemInfo && renderItemInfo(img, globalIndex)}
                  <Image
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      cursor: "pointer" 
                    }}
                    onClick={() => setSelectedIndex(globalIndex)}
                    unoptimized
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedIndex !== null && enrichedFlat[selectedIndex] && (
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
              src={enrichedFlat[selectedIndex].src}
              alt={enrichedFlat[selectedIndex].alt || enrichedFlat[selectedIndex].title || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                marginBottom: "16px",
                display: "block",
              }}
            />
            {renderModalInfo
              ? renderModalInfo(enrichedFlat[selectedIndex])
              : renderItemInfo &&
                renderItemInfo(enrichedFlat[selectedIndex], selectedIndex)}
          </div>
        </div>
      )}
    </main>
  );
}