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
  const pollingIntervalRef = useRef(null);

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

  const findGridImgElement = (index) => {
    if (index == null) return null;
    const selectors = [
      `img[data-globalindex="${index}"]`,
      `.gallery-item[data-globalindex="${index}"] img`,
      `.gallery-item[data-globalindex="${index}"] picture img`,
    ];
    for (const sel of selectors) {
      const img = document.querySelector(sel);
      if (img) return img;
    }
    return null;
  };

  const waitForGridImg = (index, { needCurrentSrc = false, timeoutMs = 4000, intervalMs = 100 } = {}) =>
    new Promise((resolve) => {
      const start = Date.now();
      const tryNow = () => {
        const img = findGridImgElement(index);
        if (!img) return false;
        const curr = img.currentSrc || img.src;
        if (!needCurrentSrc || (curr && curr.length > 0)) {
          resolve(img);
          return true;
        }
        return false;
      };
      if (tryNow()) return;
      const t = setInterval(() => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(t);
          resolve(findGridImgElement(index));
          return;
        }
        if (tryNow()) clearInterval(t);
      }, intervalMs);
    });

  const goToIndex = async (newIndex, viaArrow = false) => {
    if (newIndex < 0 || newIndex >= enrichedFlat.length) return;

    if (viaArrow) clickedIndexRef.current = null;

    const gridImg = findGridImgElement(newIndex);
    const isComplete = gridImg?.complete ?? false;
    const srcToUse = gridImg?.currentSrc || gridImg?.src || enrichedFlat[newIndex].src;

    setModalSrc(srcToUse);
    setSelectedIndex(newIndex);
    setArrowNavigation(viaArrow && !isComplete);
    setLoadingModal(viaArrow && !isComplete);
    latestSelectedRef.current = newIndex;

    if (!isComplete && gridImg) {
      const onLoad = () => {
        if (latestSelectedRef.current === newIndex) {
          currentOnScreenIndexRef.current = newIndex;
          setLoadingModal(false);
          setArrowNavigation(false);
        }
      };
      gridImg.addEventListener("load", onLoad, { once: true });
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
  }, [selectedIndex, enrichedFlat.length]);

  const handleTouchStart = (e) => {
    touchCountRef.current = e.touches.length;
    if (touchCountRef.current === 1) touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchCountRef.current > 1) return;
    const start = touchStartXRef.current;
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
    if (selectedIndex === null) return;

    latestSelectedRef.current = selectedIndex;
    const clickedIndex = clickedIndexRef.current === selectedIndex;

    let cancelled = false;

    (async () => {
      const gridImg = await waitForGridImg(selectedIndex, { needCurrentSrc: false, timeoutMs: 3000, intervalMs: 120 });
      if (cancelled) return;

      const srcToUse = gridImg ? (gridImg.currentSrc || gridImg.src) : enrichedFlat[selectedIndex].src;
      const isComplete = gridImg?.complete ?? false;
      const isOnScreen = currentOnScreenIndexRef.current === selectedIndex;

      if (clickedIndex) {
        setModalSrc(srcToUse);
        setLoadingModal(false);
        setArrowNavigation(false);
        currentOnScreenIndexRef.current = selectedIndex;
        if (!gridImg) {
          let attempts = 0;
          const bg = setInterval(() => {
            attempts++;
            const g = findGridImgElement(selectedIndex);
            if (g) {
              setModalSrc(g.currentSrc || g.src);
              clearInterval(bg);
            } else if (attempts > 20) {
              clearInterval(bg);
            }
          }, 150);
        }
        return;
      }

      setModalSrc(srcToUse);
      setLoadingModal(!isOnScreen && !isComplete);
      setArrowNavigation(!isComplete);

      if (!isComplete && gridImg) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        let attempts = 0;
        pollingIntervalRef.current = setInterval(() => {
          attempts++;
          if (gridImg.complete) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            if (latestSelectedRef.current === selectedIndex) {
              currentOnScreenIndexRef.current = selectedIndex;
              setLoadingModal(false);
              setArrowNavigation(false);
            }
          } else if (attempts > 30) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }, 150);

        const onLoad = () => {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          if (latestSelectedRef.current === selectedIndex) {
            currentOnScreenIndexRef.current = selectedIndex;
            setLoadingModal(false);
            setArrowNavigation(false);
          }
        };
        gridImg.addEventListener("load", onLoad, { once: true });
      } else {
        currentOnScreenIndexRef.current = selectedIndex;
      }
    })();

    return () => {
      cancelled = true;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedIndex, enrichedFlat, isMobile]);

  const handleGridClick = async (globalIndex) => {
    clickedIndexRef.current = globalIndex;
    latestSelectedRef.current = globalIndex;
    const gridImg = findGridImgElement(globalIndex);
    const srcToUse = gridImg?.currentSrc || gridImg?.src || enrichedFlat[globalIndex].src;

    setModalSrc(srcToUse);
    setSelectedIndex(globalIndex);
    setArrowNavigation(false);
    setLoadingModal(false);

    if (!gridImg || !gridImg.complete) {
      const onLoad = () => {
        if (latestSelectedRef.current === globalIndex) {
          currentOnScreenIndexRef.current = globalIndex;
          setLoadingModal(false);
        }
      };
      gridImg?.addEventListener("load", onLoad, { once: true });
    }
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const modal = document.querySelector(".image-modal");
    if (!modal) return;
    const updateHeight = () => {
      const vv = window.visualViewport;
      modal.style.height = vv ? vv.height + "px" : "100dvh";
    };
    updateHeight();
    window.visualViewport?.addEventListener("resize", updateHeight);
    return () => window.visualViewport?.removeEventListener("resize", updateHeight);
  }, [selectedIndex]);

  return (
    <main className="Gallery">
      {renderHeader && renderHeader()}
      {navButtons}

      <div
        className="gallery-columns"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.max(1, columns)}, 1fr)`,
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
                  data-globalindex={globalIndex}
                >
                  {renderItemInfo && renderItemInfo(img, globalIndex)}
                  <Image
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    onClick={() => handleGridClick(globalIndex)}
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
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="modal-content" style={{ position: "relative" }}>
            {modalSrc && (
              <img
                src={modalSrc}
                alt={enrichedFlat[selectedIndex].alt || enrichedFlat[selectedIndex].title || ""}
                onLoad={() => {
                  if (latestSelectedRef.current === selectedIndex) {
                    currentOnScreenIndexRef.current = selectedIndex;
                    setLoadingModal(false);
                    setArrowNavigation(false);
                  }
                }}
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
              />
            )}

            {arrowNavigation && loadingModal && (
              <div className="arrow-loading">Loading...</div>
            )}

            {renderModalInfo
              ? renderModalInfo(enrichedFlat[selectedIndex])
              : renderItemInfo?.(enrichedFlat[selectedIndex], selectedIndex)}
          </div>
        </div>
      )}
    </main>
  );
}
