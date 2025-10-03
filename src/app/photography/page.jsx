"use client";

import "../../css/photography.scss";
import Gallery from "../gallery";
import { useDarkMode } from "../useDarkMode";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const numImages = 50;
const imagePaths = [];
for (let i = 1; i <= numImages; i++) {
  imagePaths.push(`/photos/${i}.jpg`);
}

const BATCH_SIZE = 10;

export default function Photography() {
  const [_isLightMode] = useDarkMode();
  const [flatImages, setFlatImages] = useState([]); // canonical flat list (modal navigation)
  const [columns, setColumns] = useState([[], [], []]); // balanced masonry columns
  const [isMobile, setIsMobile] = useState(false);
  const [adventuresHighlighted, setAdventuresHighlighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pendingNavRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const clickCountRef = useRef(0);
  const lastHighlightTimeRef = useRef(0);
  const adventuresRef = useRef(null);

  const sentinelRef = useRef(null);
  const flatImagesRef = useRef([]);
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  const columnGroups = useMemo(() => [[41, 44]], []);

  useEffect(() => {
    flatImagesRef.current = flatImages;
  }, [flatImages]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // column balancing logic
  const computeColumnsFromFlat = useCallback(
    (flatArr) => {
      const colHeights = [0, 0, 0];
      const colImages = [[], [], []];
      const placed = new Set();

      for (let i = 0; i < flatArr.length; i++) {
        const imgNum = i + 1;
        if (placed.has(imgNum)) continue;

        const group = columnGroups.find((g) => g[0] === imgNum);
        if (group) {
          const minIndex = colHeights.indexOf(Math.min(...colHeights));
          for (const groupImgNum of group) {
            const imgIdx = groupImgNum - 1;
            if (flatArr[imgIdx]) {
              colImages[minIndex].push(flatArr[imgIdx]);
              colHeights[minIndex] += flatArr[imgIdx].ratio ?? (flatArr[imgIdx].height / (flatArr[imgIdx].width || 800));
              placed.add(groupImgNum);
            }
          }
        } else {
          const minIndex = colHeights.indexOf(Math.min(...colHeights));
          colImages[minIndex].push(flatArr[i]);
          colHeights[minIndex] += flatArr[i].ratio ?? (flatArr[i].height / (flatArr[i].width || 800));
          placed.add(imgNum);
        }
      }

      return colImages;
    },
    [columnGroups]
  );

  const loadBatch = useCallback(async () => {
    if (isLoadingRef.current) return;
    const currentLen = flatImagesRef.current.length;
    if (currentLen >= imagePaths.length) return;

    isLoadingRef.current = true;
    if (mountedRef.current) setIsLoading(true);

    try {
      const startIdx = currentLen;
      const endIdx = Math.min(startIdx + BATCH_SIZE, imagePaths.length);
      const batchPaths = imagePaths.slice(startIdx, endIdx);

      const loadedImages = await Promise.all(
        batchPaths.map(
          (src) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.src = src;
              img.onload = () =>
                resolve({
                  src,
                  alt: `Photo ${src.split("/").pop().split(".")[0]}`,
                  width: img.naturalWidth || 800,
                  height: img.naturalHeight || 600,
                  ratio: img.naturalWidth ? img.naturalHeight / img.naturalWidth : 600 / 800,
                });
              img.onerror = () =>
                resolve({
                  src,
                  alt: `Photo ${src.split("/").pop().split(".")[0]}`,
                  width: 800,
                  height: 600,
                  ratio: 600 / 800,
                });
            })
        )
      );

      if (!mountedRef.current) return;

      const newFlatImages = [...flatImagesRef.current, ...loadedImages];
      flatImagesRef.current = newFlatImages;
      if (mountedRef.current) setFlatImages(newFlatImages);

      const colImages = computeColumnsFromFlat(newFlatImages);
      if (mountedRef.current) setColumns(colImages);
    } finally {
      isLoadingRef.current = false;
      if (mountedRef.current) setIsLoading(false);
    }
  }, [computeColumnsFromFlat]);

  useEffect(() => {
    let observer = null;
    let retryInterval = null;
    let cancelled = false;

    (async () => {
      try {
        await loadBatch();

        const MAX_EXTRA_BATCHES = 3;
        for (let i = 0; i < MAX_EXTRA_BATCHES && !cancelled; i++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));

          const bodyHeight = document.body.scrollHeight || 0;
          if (bodyHeight > window.innerHeight + 200) break;
          if (flatImagesRef.current.length >= imagePaths.length) break;
          await loadBatch();
        }
      } catch (e) {
      }
    })();

    const onIntersect = (entries) => {
      if (entries && entries[0] && entries[0].isIntersecting) {
        loadBatch().catch(() => {});
      }
    };

    observer = new IntersectionObserver(onIntersect, { rootMargin: "200px" });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    } else {
      // retry sentinel mount check
      let tries = 0;
      retryInterval = setInterval(() => {
        tries += 1;
        if (sentinelRef.current) {
          observer.observe(sentinelRef.current);
          clearInterval(retryInterval);
          retryInterval = null;
        } else if (tries > 10) {
          clearInterval(retryInterval);
          retryInterval = null;
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [loadBatch]);

  // track text selection & update highlight state + timestamp for easter egg
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim().toLowerCase() : "";
      const contains = text.includes("adventures");
      setAdventuresHighlighted(contains);
      if (contains) {
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

  // mobile tap detection for easter egg
  useEffect(() => {
    const onTouchStart = (e) => {
      if (!isMobile) return;
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const rect = adventuresRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = touch.clientX;
      const y = touch.clientY;
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!inside) return;

      const selectionNow = window.getSelection();
      const selTextNow = selectionNow ? selectionNow.toString().trim().toLowerCase() : "";
      const isHighlightedNow = selTextNow.includes("adventures");
      if (!isHighlightedNow) return;

      const now = Date.now();
      const lastHighlightAt = lastHighlightTimeRef.current || 0;
      const timeSinceHighlight = now - lastHighlightAt;

      if (timeSinceHighlight < 300) { // touch from long press highlight
        return;
      }

      setTimeout(() => {
        window.location.href = "/adventures";
      }, 0);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart, { passive: true });
    };
  }, [isMobile]);

  const handleAdventuresClick = (e) => {
    if (isMobile) return;

    const now = Date.now();
    const timeSinceLast = now - lastClickTimeRef.current;

    if (timeSinceLast < 400) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1; // reset after time gap
    }
    lastClickTimeRef.current = now;

    const selection = window.getSelection();
    const isHighlightedNow =
      adventuresHighlighted ||
      (selection && selection.toString().trim().includes("adventures"));

    if (!isHighlightedNow) return;

    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current);
      pendingNavRef.current = null;
    }

    pendingNavRef.current = window.setTimeout(() => {
      pendingNavRef.current = null;

      if (clickCountRef.current === 2 || clickCountRef.current === 3) {
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

  const handleAdventuresDoubleClick = () => {
    if (pendingNavRef.current) {
      clearTimeout(pendingNavRef.current);
      pendingNavRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pendingNavRef.current) {
        clearTimeout(pendingNavRef.current);
        pendingNavRef.current = null;
      }
    };
  }, []);

  const modalOrder = flatImages;
  const layoutColumns = isMobile ? [flatImages] : columns;

  const showLoading = isLoading && flatImages.length < imagePaths.length;

  return (
    <main className="Photography">
      <Gallery
        images={modalOrder}
        columns={isMobile ? 1 : 3}
        isMobile={isMobile}
        renderHeader={() => (
          <div className="gallery-header">
            <h1>Photography</h1>
            <p id="adventures-text" style={{ display: "inline" }}>
              Captured moments from my{" "}
              <span
                ref={adventuresRef}
                role="link"
                tabIndex={0}
                aria-pressed={adventuresHighlighted}
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
        customColumns={layoutColumns}
      />
      {showLoading && <div className="loading">Loading images...</div>}
      <div id="load-more-sentinel" ref={sentinelRef} style={{ height: "40px" }} />
    </main>
  );
}
