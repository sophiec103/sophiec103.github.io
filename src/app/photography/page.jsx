"use client";

import "../../css/photography.scss";
import { useDarkMode } from '../useDarkMode';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const imagePaths = [];

for (let i = 1; i <= 40; i++) {
  imagePaths.push(`/photos/${i}.jpg`);
}

export default function Photography() {
  const [isLightMode] = useDarkMode();
  const [selectedImage, setSelectedImage] = useState(null);
  const [columns, setColumns] = useState([[], [], []]);

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
    };

    loadImageDimensions();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
  
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <main className={`Photography ${!isLightMode ? 'dark-mode' : ''}`}>
      <div className="gallery-header">
        <h1>Photography</h1>
        <p>Captured moments from my adventures</p>
      </div>

      {columns.flat().length > 0 ? (
        <div className="gallery-container">
          <div className="gallery-columns">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="gallery-column">
                {column.map((image, index) => (
                  <div
                    key={index}
                    className="gallery-item"
                    onClick={() => setSelectedImage(image)}
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
            ))}
          </div>
        </div>
      ) : (
        <div className="loading">Loading images...</div>
      )}

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
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
