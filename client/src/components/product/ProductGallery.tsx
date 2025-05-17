import { useState, useEffect, useRef } from "react";
import type { ProductImage } from "../../types";

interface ProductGalleryProps {
  images: (ProductImage | string)[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const mainImageRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLDivElement>(null);

  // Get the image URL, handling both string and object formats
  const getImageUrl = (image: ProductImage | string): string => {
    if (typeof image === "string") {
      return image;
    }
    return image.url;
  };

  // Get the image alt text, handling both formats
  const getImageAlt = (image: ProductImage | string, index: number): string => {
    if (typeof image === "string") {
      return `${productName} - Image ${index + 1}`;
    }
    return image.alt || `${productName} - Image ${index + 1}`;
  };

  // Process images to ensure we have valid URLs
  const processedImages = images.filter((img) => {
    const url = getImageUrl(img);
    return url && url.length > 0;
  });

  // Preload images for smoother experience
  useEffect(() => {
    if (processedImages.length === 0) return;

    setIsLoading(true);
    let loadedCount = 0;

    processedImages.forEach((img) => {
      const imgEl = new Image();
      imgEl.src = getImageUrl(img);
      imgEl.onload = () => {
        loadedCount++;
        if (loadedCount === processedImages.length) {
          setIsLoading(false);
        }
      };
      imgEl.onerror = () => {
        loadedCount++;
        if (loadedCount === processedImages.length) {
          setIsLoading(false);
        }
      };
    });
  }, [processedImages]);

  // Handle keyboard navigation in lightbox mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  // Handle image zoom
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mainImageRef.current || !zoomImageRef.current || !isZoomed) return;

    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();

    // Calculate cursor position as percentages
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Update zoom position
    setZoomPosition({ x, y });
  };

  // If no images, show placeholder
  if (processedImages.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-amber-800 font-serif italic text-lg">
          No image available
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {/* Main image display */}
      <div
        className="relative mb-6 overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-lg aspect-square"
        ref={mainImageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mb-4"></div>
              <span className="text-amber-800 text-sm font-medium">
                Loading gallery
              </span>
            </div>
          </div>
        )}

        {/* Main image */}
        <div
          className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={getImageUrl(processedImages[currentImageIndex])}
            alt={getImageAlt(
              processedImages[currentImageIndex],
              currentImageIndex
            )}
            className={`max-w-full max-h-full object-contain transition-all duration-500 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>

        {/* Zoom overlay */}
        {isZoomed && !isLoading && (
          <div
            ref={zoomImageRef}
            className="absolute inset-0 pointer-events-none z-20 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              backgroundImage: `url(${getImageUrl(
                processedImages[currentImageIndex]
              )})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "200%",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        )}

        {/* Navigation controls */}
        {processedImages.length > 1 && !isLoading && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-full flex items-center justify-center text-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 z-30"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-full flex items-center justify-center text-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 z-30"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {processedImages.length > 1 && !isLoading && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-full text-amber-800 text-xs font-medium shadow-md">
            {currentImageIndex + 1} / {processedImages.length}
          </div>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-xs font-medium shadow-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Hover to zoom
        </div>
      </div>

      {/* Thumbnail gallery - modern horizontal scrolling design */}
      {processedImages.length > 1 && !isLoading && (
        <div className="relative">
          <div className="overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex space-x-3">
              {processedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md focus:outline-none transition-all duration-300 ${
                    index === currentImageIndex
                      ? "ring-2 ring-amber-600 scale-105 shadow-md"
                      : "ring-1 ring-gray-200 hover:ring-amber-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={getImageAlt(image, index)}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-amber-300 transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full">
            <img
              src={getImageUrl(processedImages[currentImageIndex])}
              alt={getImageAlt(
                processedImages[currentImageIndex],
                currentImageIndex
              )}
              className="w-full h-full object-contain"
            />
          </div>

          {processedImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Add custom styling for hiding scrollbars while maintaining functionality */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default ProductGallery;
