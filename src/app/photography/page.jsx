"use client";

import "../../css/photography.scss";
import { useDarkMode } from '../useDarkMode';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const imagePaths = [];
for (let i = 1; i <= 46; i++) {
  imagePaths.push(`/photos/${i}.jpg`);
}

export default function Photography() {
  const [isLightMode] = useDarkMode();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [columns, setColumns] = useState([[], [], []]);
  const [flatImages, setFlatImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadImageDimensions = async () => {
      const loadedImages = await Promise.all(
        imagePaths.map((src) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
              const width = img.naturalWidth;
              const height = img.naturalHeight;
              resolve({
                src,
                alt: `Photo ${src.split('/').pop().split('.')[0]}`,
                width,
                height,
                ratio: height / width,
              });
            };
          });
        })
      );

      const colHeights = [0, 0, 0];
      const colImages = [[], [], []];

      for (const img of loadedImages) {
        const minIndex = colHeights.indexOf(Math.min(...colHeights));
        colImages[minIndex].push(img);
        colHeights[minIndex] += img.ratio;
      }

      setColumns(colImages);
      setFlatImages(loadedImages);
    };

    loadImageDimensions();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex !== null) {
        if (e.key === 'Escape') {
          setSelectedIndex(null);
        } else if (e.key === 'ArrowLeft') {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'ArrowRight') {
          setSelectedIndex((prev) => (prev < flatImages.length - 1 ? prev + 1 : prev));
        }
      }
    };

    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, flatImages.length]);

  return (
    <main className={`Photography ${!isLightMode ? 'dark-mode' : ''}`}>
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
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                    unoptimized={true}
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
                    const flatIndex = flatImages.findIndex(img => img.src === image.src);
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
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                          unoptimized={true}
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
        <div className="image-modal" onClick={() => setSelectedIndex(null)}>
          <div className="modal-content">
            <img
              src={flatImages[selectedIndex].src}
              alt={flatImages[selectedIndex].alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
