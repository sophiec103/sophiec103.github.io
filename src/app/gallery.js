"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
  zoomLevel: zoomLevelProp = 4,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalSrc, setModalSrc] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [arrowNavigation, setArrowNavigation] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const touchStartXRef = useRef(null);
  const touchCountRef = useRef(0);
  const latestSelectedRef = useRef(null);
  const clickedIndexRef = useRef(null);
  const currentOnScreenIndexRef = useRef(null);
  const modalImageRef = useRef(null);
  const lastTouchDistanceRef = useRef(null);
  const initialPinchCenterRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const modalContentRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const savedScrollYRef = useRef(0);

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

  const resetZoom = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    hasDraggedRef.current = false;
  };

  const goToIndex = async (newIndex, viaArrow = false) => {
    if (newIndex < 0 || newIndex >= enrichedFlat.length) return;

    if (viaArrow) clickedIndexRef.current = null;
    resetZoom();

    const gridImg = findGridImgElement(newIndex);
    
    let srcToUse = enrichedFlat[newIndex].src;
    
    if (gridImg) {
      if (gridImg.currentSrc && gridImg.currentSrc.length > 0) {
        srcToUse = gridImg.currentSrc;
      } else if (gridImg.src && gridImg.src.length > 0) {
        srcToUse = gridImg.src;
      }
    }

    setSelectedIndex(newIndex);
    setModalSrc(srcToUse);
    latestSelectedRef.current = newIndex;
    
    if (viaArrow) {
      setLoadingModal(true);
      setArrowNavigation(true);
    } else {
      setLoadingModal(false);
      setArrowNavigation(false);
    }
  };

  const constrainPan = (x, y, currentZoom) => {
    const img = modalImageRef.current;
    if (!img || currentZoom <= 1) return { x: 0, y: 0 };

    const rect = img.getBoundingClientRect();
    const modal = modalOverlayRef.current;
    const viewportWidth = modal ? modal.clientWidth : window.innerWidth;
    const viewportHeight = modal ? modal.clientHeight : window.innerHeight;
    
    const zoomedWidth = rect.width * currentZoom;
    const zoomedHeight = rect.height * currentZoom;
    
    let maxX = 0;
    let maxY = 0;
    
    if (zoomedWidth > viewportWidth) {
      maxX = ((zoomedWidth - viewportWidth) / 2) / currentZoom;
    }
    
    if (zoomedHeight > viewportHeight) {
      maxY = ((zoomedHeight - viewportHeight) / 2) / currentZoom;
    }

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const handleImageClick = (e) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    
    const img = modalImageRef.current;
    if (!img) return;

    if (!isZoomed) {
      const rect = img.getBoundingClientRect();
      
      const clickX = e.clientX - (rect.left + rect.width / 2);
      const clickY = e.clientY - (rect.top + rect.height / 2);
      
      setIsZoomed(true);
      setZoomLevel(zoomLevelProp);
      
      const desiredPanX = -clickX * zoomLevelProp;
      const desiredPanY = -clickY * zoomLevelProp;
      
      const constrained = constrainPan(desiredPanX, desiredPanY, zoomLevelProp);
      setPanPosition(constrained);
    } else {
      resetZoom();
    }
  };

  const handleMouseDown = (e) => {
    if (!isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isZoomed) return;
    hasDraggedRef.current = true;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const constrained = constrainPan(newX, newY, zoomLevel);
    setPanPosition(constrained);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    
    const newX = panPosition.x - deltaX;
    const newY = panPosition.y - deltaY;
    const constrained = constrainPan(newX, newY, zoomLevel);
    setPanPosition(constrained);
  };

  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = (e) => {
    touchCountRef.current = e.touches.length;
    
    if (touchCountRef.current === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistanceRef.current = distance;
      initialPinchCenterRef.current = getTouchCenter(touch1, touch2);
    } else if (touchCountRef.current === 1) {
      if (isZoomed) {
        setIsDragging(true);
        hasDraggedRef.current = false;
        setDragStart({ 
          x: e.touches[0].clientX - panPosition.x, 
          y: e.touches[0].clientY - panPosition.y 
        });
      } else {
        touchStartXRef.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!lastTouchDistanceRef.current || !initialPinchCenterRef.current) return;
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = distance / lastTouchDistanceRef.current;
      const newZoom = Math.max(1, Math.min(5, zoomLevel * scale));
      
      if (newZoom > 1) {
        setIsZoomed(true);
        setZoomLevel(newZoom);
        
        const currentCenter = getTouchCenter(touch1, touch2);
        const deltaX = currentCenter.x - initialPinchCenterRef.current.x;
        const deltaY = currentCenter.y - initialPinchCenterRef.current.y;
        
        const newPanX = panPosition.x + deltaX;
        const newPanY = panPosition.y + deltaY;
        const constrained = constrainPan(newPanX, newPanY, newZoom);
        setPanPosition(constrained);
        
        initialPinchCenterRef.current = currentCenter;
      } else {
        resetZoom();
      }
      
      lastTouchDistanceRef.current = distance;
    } else if (e.touches.length === 1 && isZoomed && isDragging) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = true;
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      const constrained = constrainPan(newX, newY, zoomLevel);
      setPanPosition(constrained);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchCountRef.current === 2) {
      lastTouchDistanceRef.current = null;
      initialPinchCenterRef.current = null;
    } else if (touchCountRef.current === 1 && !isZoomed) {
      const start = touchStartXRef.current;
      if (start == null) return;
      const end = e.changedTouches?.[0]?.clientX;
      if (end == null) return;
      const diff = end - start;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToIndex(selectedIndex - 1, true);
        else goToIndex(selectedIndex + 1, true);
      }
    }
    setIsDragging(false);
    touchCountRef.current = 0;
  };

  // prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      if (savedScrollYRef.current === 0) {
        savedScrollYRef.current = window.scrollY;
      }
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollYRef.current}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = savedScrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
      savedScrollYRef.current = 0;
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
        clickedIndexRef.current = null;
        currentOnScreenIndexRef.current = null;
        resetZoom();
      } else if (e.key === "ArrowLeft" && !isZoomed) {
        goToIndex(selectedIndex - 1, true);
      } else if (e.key === "ArrowRight" && !isZoomed) {
        goToIndex(selectedIndex + 1, true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, enrichedFlat.length, isZoomed]);

  const handleGridClick = async (globalIndex) => {
    clickedIndexRef.current = globalIndex;
    latestSelectedRef.current = globalIndex;
    resetZoom();
    
    const gridImg = findGridImgElement(globalIndex);
    
    let srcToUse = enrichedFlat[globalIndex].src;
    
    if (gridImg) {
      if (gridImg.currentSrc && gridImg.currentSrc.length > 0) {
        srcToUse = gridImg.currentSrc;
      } else if (gridImg.src && gridImg.src.length > 0) {
        srcToUse = gridImg.src;
      }
    }

    setModalSrc(srcToUse);
    setSelectedIndex(globalIndex);
    setArrowNavigation(false);
    setLoadingModal(false);
    currentOnScreenIndexRef.current = globalIndex;
  };

  const handleModalImageLoad = () => {
    if (latestSelectedRef.current === selectedIndex) {
      currentOnScreenIndexRef.current = selectedIndex;
      setLoadingModal(false);
      setArrowNavigation(false);
    }
  };

  const shouldShowLoading = loadingModal && arrowNavigation && currentOnScreenIndexRef.current !== selectedIndex;

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
                  <img
                    src={img.src}
                    alt={img.alt || img.title || ""}
                    width={img.width || 800}
                    height={img.height || 500}
                    onClick={() => handleGridClick(globalIndex)}
                    loading="lazy"
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
          ref={modalOverlayRef}
          className="image-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isZoomed) {
              setSelectedIndex(null);
              clickedIndexRef.current = null;
              currentOnScreenIndexRef.current = null;
              resetZoom();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div 
            ref={modalContentRef}
            className="modal-content" 
            style={{ position: "relative" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {modalSrc && (
              <img
                ref={modalImageRef}
                src={modalSrc}
                alt={enrichedFlat[selectedIndex].alt || enrichedFlat[selectedIndex].title || ""}
                onClick={handleImageClick}
                onLoad={handleModalImageLoad}
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "80vh", 
                  objectFit: "contain",
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                  touchAction: 'none',
                  pointerEvents: 'auto'
                }}
                draggable={false}
              />
            )}

            {shouldShowLoading && (
              <div className="arrow-loading">Loading...</div>
            )}

            {!isZoomed && (renderModalInfo
              ? renderModalInfo(enrichedFlat[selectedIndex])
              : renderItemInfo?.(enrichedFlat[selectedIndex], selectedIndex))}
          </div>
        </div>
      )}
    </main>
  );
}