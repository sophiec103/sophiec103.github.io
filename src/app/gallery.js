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
  const [modalSrc, setModalSrc] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [arrowNavigation, setArrowNavigation] = useState(false);

  const touchStartXRef = useRef(null);
  const touchCountRef = useRef(0);
  const latestSelectedRef = useRef(null);

  const sourceFlat = useMemo(() => {
    if (images && images.length) return images;
    if (customColumns && customColumns.length) return customColumns.flat();
    return [];
  }, [images, customColumns]);

  const enrichedFlat = useMemo(
    () => sourceFlat.map((it, idx) => ({ ...it, globalIndex: idx })),
    [sourceFlat]
  );

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
    latestSelectedRef.current = selectedIndex;
  }, [selectedIndex]);

  const goToIndex = (newIndex, viaArrow = false) => {
    if (newIndex < 0 || newIndex >= enrichedFlat.length) return;
    const imgInGrid = document.querySelector(
      `img[data-globalindex="${newIndex}"]`
    );
    if (imgInGrid) {
      setLoadingModal(!imgInGrid.complete);
      setSelectedIndex(newIndex);
      setArrowNavigation(viaArrow && !imgInGrid.complete);
    } else {
      setLoadingModal(true);
      setSelectedIndex(newIndex);
      setArrowNavigation(viaArrow);
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") goToIndex(selectedIndex - 1, true);
      if (e.key === "ArrowRight") goToIndex(selectedIndex + 1, true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handleTouchStart = (e) => {
    touchCountRef.current = e.touches.length;
    if (touchCountRef.current === 1) {
      touchStartXRef.current = e.touches[0].clientX;
    } else {
      touchStartXRef.current = null;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchCountRef.current > 1) {
      touchCountRef.current = 0;
      return;
    }

    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    touchCountRef.current = 0;

    if (start == null) return;
    const end = e.changedTouches?.[0]?.clientX;
    if (end == null) return;

    const diff = end - start;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToIndex(selectedIndex - 1, true);
      else goToIndex(selectedIndex + 1, true);
    }
  };

  useEffect(() => {
    if (selectedIndex === null) {
      setModalSrc(null);
      setLoadingModal(false);
      setArrowNavigation(false);
      return;
    }

    const item = enrichedFlat[selectedIndex];
    if (!item) {
      setModalSrc(null);
      setLoadingModal(false);
      setArrowNavigation(false);
      return;
    }

    const imgInGrid = document.querySelector(
      `img[data-globalindex="${selectedIndex}"]`
    );
    if (imgInGrid) {
      const srcToUse = imgInGrid.currentSrc || imgInGrid.src || item.src;
      setModalSrc(srcToUse);
      if (imgInGrid.complete) setLoadingModal(false);
      else {
        setLoadingModal(true);
        const onLoad = () => {
          if (latestSelectedRef.current === selectedIndex) setLoadingModal(false);
          imgInGrid.removeEventListener("load", onLoad);
        };
        imgInGrid.addEventListener("load", onLoad);
      }
    } else {
      setModalSrc(item.src);
      setLoadingModal(true);
    }
  }, [selectedIndex, enrichedFlat]);

  return (
    <main className="Gallery">
      {renderHeader && renderHeader()}
      {navButtons}

      <div className="gallery-columns" style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.max(1, columns)}, 1fr)`,
        gap: "32px"
      }}>
        {colArr.map((column, colIdx) => (
          <div key={colIdx} className="gallery-column">
            {column.map((img) => {
              const globalIndex = img?.globalIndex ?? 0;
              return (
                <div key={globalIndex} className="gallery-item"
                     id={withItemIds ? `adventure-${globalIndex}` : undefined}>
                  {renderItemInfo && renderItemInfo(img, globalIndex)}
                  <Image
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    onClick={() => {
                      setLoadingModal(false);
                      setArrowNavigation(false);
                      setSelectedIndex(globalIndex);
                    }}
                    unoptimized
                    data-globalindex={globalIndex}
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
            {arrowNavigation && loadingModal && (
              <div className="arrow-loading">Loading...</div>
            )}
            {modalSrc && (
              <img
                src={modalSrc}
                alt={enrichedFlat[selectedIndex].alt || enrichedFlat[selectedIndex].title || ""}
                onLoad={() => {
                  if (latestSelectedRef.current === selectedIndex) setLoadingModal(false);
                  setArrowNavigation(false);
                }}
              />
            )}
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
