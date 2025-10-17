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
  const clickedIndexRef = useRef(null);
  const currentOnScreenIndexRef = useRef(null);

  const sourceFlat = useMemo(() => {
    if (images.length) return images;
    if (customColumns?.length) return customColumns.flat();
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
    return (
      enrichedByKey.get(key) ||
      enrichedFlat.find(
        (f) => f.src === item.src || (item.alt && f.alt === item.alt)
      ) || { ...item, globalIndex: enrichedFlat.length }
    );
  };

  const colArr = useMemo(() => {
    if (customColumns?.length) {
      return customColumns.map((col) => col.map((it) => getEnrichedFor(it)));
    }
    const arr = Array.from({ length: Math.max(1, columns) }, () => []);
    enrichedFlat.forEach((item, idx) => arr[idx % arr.length].push(item));
    return arr;
  }, [customColumns, enrichedFlat, columns]);

  latestSelectedRef.current = selectedIndex;

  const goToIndex = (newIndex, viaArrow = false) => {
    if (newIndex < 0 || newIndex >= enrichedFlat.length) return;

    const imgInGrid = document.querySelector(
      `img[data-globalindex="${newIndex}"]`
    );
    const srcToUse = imgInGrid
      ? imgInGrid.currentSrc || imgInGrid.src
      : enrichedFlat[newIndex].src;
    const isComplete = imgInGrid?.complete ?? false;
    const isOnScreen = currentOnScreenIndexRef.current === newIndex;

    setModalSrc(srcToUse);
    setSelectedIndex(newIndex);
    setArrowNavigation(viaArrow && !isComplete);
    setLoadingModal(viaArrow && !isComplete && !isOnScreen);

    if (!isComplete) {
      imgInGrid?.addEventListener(
        "load",
        () => {
          if (latestSelectedRef.current === newIndex) {
            currentOnScreenIndexRef.current = newIndex;
            setLoadingModal(false);
            setArrowNavigation(false);
          }
        },
        { once: true }
      );
    } else {
      currentOnScreenIndexRef.current = newIndex;
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
        clickedIndexRef.current = null;
        currentOnScreenIndexRef.current = null;
      } else if (e.key === "ArrowLeft") {
        goToIndex(selectedIndex - 1, true);
      } else if (e.key === "ArrowRight") {
        goToIndex(selectedIndex + 1, true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handleTouchStart = (e) => {
    touchCountRef.current = e.touches.length;
    if (touchCountRef.current === 1)
      touchStartXRef.current = e.touches[0].clientX;
    else touchStartXRef.current = null;
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
      clickedIndexRef.current = null;
      currentOnScreenIndexRef.current = null;
      return;
    }

    const item = enrichedFlat[selectedIndex];
    const imgInGrid = document.querySelector(
      `img[data-globalindex="${selectedIndex}"]`
    );
    const srcToUse = imgInGrid
      ? imgInGrid.currentSrc || imgInGrid.src
      : item.src;
    const isComplete = imgInGrid?.complete ?? false;
    const isOnScreen = currentOnScreenIndexRef.current === selectedIndex;

    setModalSrc(srcToUse);
    setLoadingModal(!isOnScreen && !isComplete);

    if (!isComplete) {
      imgInGrid?.addEventListener(
        "load",
        () => {
          if (latestSelectedRef.current === selectedIndex) {
            currentOnScreenIndexRef.current = selectedIndex;
            setLoadingModal(false);
            setArrowNavigation(false);
          }
        },
        { once: true }
      );
    } else {
      currentOnScreenIndexRef.current = selectedIndex;
    }
  }, [selectedIndex, enrichedFlat]);

  return (
    <main className="Gallery">
      {renderHeader && renderHeader()}
      {navButtons}

      <div
        className="gallery-columns"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : `repeat(${Math.max(1, columns)}, 1fr)`,
          gap: "32px",
        }}
      >
        {colArr.map((column, colIdx) => (
          <div key={colIdx} className="gallery-column">
            {column.map((img) => {
              const globalIndex = img.globalIndex ?? 0;
              return (
                <div
                  key={globalIndex}
                  className="gallery-item"
                  id={withItemIds ? `adventure-${globalIndex}` : undefined}
                >
                  {renderItemInfo && renderItemInfo(img, globalIndex)}
                  <Image
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    onClick={() => {
                      clickedIndexRef.current = globalIndex;
                      currentOnScreenIndexRef.current = globalIndex;
                      const imgInGrid = document.querySelector(
                        `img[data-globalindex="${globalIndex}"]`
                      );
                      const srcToUse = imgInGrid
                        ? imgInGrid.currentSrc || imgInGrid.src
                        : img.src;
                      setModalSrc(srcToUse);
                      setLoadingModal(false);
                      setArrowNavigation(false);
                      setSelectedIndex(globalIndex);
                      latestSelectedRef.current = globalIndex;
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
            if (e.target === e.currentTarget) {
              setSelectedIndex(null);
              clickedIndexRef.current = null;
              currentOnScreenIndexRef.current = null;
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-content" style={{ position: "relative" }}>
            {modalSrc && (
              <img
                src={modalSrc}
                alt={
                  enrichedFlat[selectedIndex].alt ||
                  enrichedFlat[selectedIndex].title ||
                  ""
                }
                onLoad={() => {
                  if (latestSelectedRef.current === selectedIndex) {
                    currentOnScreenIndexRef.current = selectedIndex;
                    setLoadingModal(false);
                    setArrowNavigation(false);
                  }
                }}
              />
            )}

            {arrowNavigation && loadingModal && (
              <div className="arrow-loading">Loading...</div>
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
