import { useState, useEffect, useCallback } from "react";
import { ZoomIn, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface ProductImage {
  url: string;
  alt?: string;
  isDefault?: boolean;
  _id?: string;
}

interface ProductGalleryProps {
  images: (ProductImage | string)[];
  productName: string;
}

interface ImageStatus {
  url: string;
  isValid: boolean;
  isLoaded: boolean;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showZoom, setShowZoom] = useState<boolean>(false);

  // Process images
  const getImageUrl = (image: ProductImage | string): string =>
    typeof image === "string" ? image : image.url;

  const getImageAlt = (image: ProductImage | string, index: number): string =>
    typeof image === "string"
      ? `${productName} - Image ${index + 1}`
      : image.alt || `${productName} - Image ${index + 1}`;

  // Filter valid images and sort to put default image first
  const processedImages = images
    .filter((img) => getImageUrl(img))
    .sort((a, b) => {
      if (typeof a !== "string" && typeof b !== "string") {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
      } else if (typeof a !== "string" && a.isDefault) {
        return -1;
      } else if (typeof b !== "string" && b.isDefault) {
        return 1;
      }
      return 0;
    });

  // Get valid images with their original indices
  const validImageIndices = imageStatuses
    .map((status, index) => (status?.isValid ? index : -1))
    .filter((index) => index !== -1);

  // Preload images with proper error handling
  useEffect(() => {
    if (!processedImages.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const statuses: ImageStatus[] = [];
    let processedCount = 0;

    const checkComplete = () => {
      if (processedCount === processedImages.length) {
        setImageStatuses(statuses);
        setIsLoading(false);

        // Reset selected image if current one is invalid
        const validIndexes = statuses
          .map((status, index) => (status.isValid ? index : -1))
          .filter((index) => index !== -1);

        if (validIndexes.length > 0 && !statuses[selectedImageIndex]?.isValid) {
          setSelectedImageIndex(validIndexes[0]);
        }
      }
    };

    processedImages.forEach((img, index) => {
      const imageUrl = getImageUrl(img);
      const imgEl = new Image();

      // Initialize status
      statuses[index] = {
        url: imageUrl,
        isValid: false,
        isLoaded: false,
      };

      imgEl.onload = () => {
        statuses[index] = {
          url: imageUrl,
          isValid: true,
          isLoaded: true,
        };
        processedCount++;
        checkComplete();
      };

      imgEl.onerror = () => {
        statuses[index] = {
          url: imageUrl,
          isValid: false,
          isLoaded: true,
        };
        processedCount++;
        checkComplete();
      };

      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!statuses[index].isLoaded) {
          statuses[index] = {
            url: imageUrl,
            isValid: false,
            isLoaded: true,
          };
          processedCount++;
          checkComplete();
        }
      }, 10000);

      imgEl.src = imageUrl;
    });

    return () => {
      processedCount = processedImages.length;
    };
  }, [processedImages.map((img) => getImageUrl(img)).join(",")]);

  // Handle zoom effect with bounds checking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setZoomPosition({ x, y });
  }, []);

  // Simplified Navigation - just work with valid indices
  const goToPrevious = () => {
    if (validImageIndices.length <= 1) return;

    const currentValidIndex = validImageIndices.indexOf(selectedImageIndex);
    if (currentValidIndex === -1) {
      // Current image is invalid, go to first valid
      setSelectedImageIndex(validImageIndices[0]);
      return;
    }

    const prevValidIndex =
      currentValidIndex === 0
        ? validImageIndices.length - 1
        : currentValidIndex - 1;
    setSelectedImageIndex(validImageIndices[prevValidIndex]);
  };

  const goToNext = () => {
    if (validImageIndices.length <= 1) return;

    const currentValidIndex = validImageIndices.indexOf(selectedImageIndex);
    if (currentValidIndex === -1) {
      // Current image is invalid, go to first valid
      setSelectedImageIndex(validImageIndices[0]);
      return;
    }

    const nextValidIndex =
      currentValidIndex === validImageIndices.length - 1
        ? 0
        : currentValidIndex + 1;
    setSelectedImageIndex(validImageIndices[nextValidIndex]);
  };

  // Handle image load error in main display
  const handleMainImageError = () => {
    if (validImageIndices.length > 0) {
      const currentValidIndex = validImageIndices.indexOf(selectedImageIndex);
      const nextValidIndex =
        currentValidIndex + 1 < validImageIndices.length
          ? currentValidIndex + 1
          : 0;
      setSelectedImageIndex(validImageIndices[nextValidIndex]);
    }
  };

  // No images available
  if (!processedImages.length) {
    return (
      <div className="flex items-center justify-center h-[550px] bg-white border border-gray-200 rounded-2xl">
        <div className="text-center">
          <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            No images available
          </p>
        </div>
      </div>
    );
  }

  // All images failed to load
  if (!isLoading && validImageIndices.length === 0) {
    return (
      <div className="flex items-center justify-center h-[550px] bg-white border border-gray-200 rounded-2xl">
        <div className="text-center">
          <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Images could not be loaded
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please check your internet connection
          </p>
        </div>
      </div>
    );
  }

  const currentImageStatus = imageStatuses[selectedImageIndex];
  const isCurrentImageValid = currentImageStatus?.isValid;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Main Image Container */}
      <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 hover:scale-[1.01] transition-transform duration-200">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
          </div>
        )}

        {/* Main Image */}
        <div
          className="relative w-full h-[550px]"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
        >
          {!isLoading && isCurrentImageValid ? (
            <img
              src={getImageUrl(processedImages[selectedImageIndex])}
              alt={getImageAlt(
                processedImages[selectedImageIndex],
                selectedImageIndex
              )}
              className="w-full h-full object-contain p-6 transition-opacity duration-500"
              onError={handleMainImageError}
            />
          ) : !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Image unavailable</p>
              </div>
            </div>
          ) : null}

          {/* Zoom Square */}
          {showZoom && !isLoading && isCurrentImageValid && (
            <div
              className="absolute w-48 h-48 border-4 border-blue-400 rounded-xl pointer-events-none bg-white/70 shadow-lg"
              style={{
                top: `clamp(0px, calc(${zoomPosition.y}% - 96px), calc(100% - 192px))`,
                left: `clamp(0px, calc(${zoomPosition.x}% - 96px), calc(100% - 192px))`,
                backgroundImage: `url(${getImageUrl(
                  processedImages[selectedImageIndex]
                )})`,
                backgroundSize: "300%",
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>

        {/* Navigation Controls */}
        {validImageIndices.length > 1 && !isLoading && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2.5 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2.5 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Zoom Hint */}
        {!isLoading && isCurrentImageValid && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-1 flex items-center text-xs text-gray-600 border border-gray-200">
            <ZoomIn className="w-3.5 h-3.5 mr-1" />
            Hover to zoom
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {validImageIndices.length > 1 && !isLoading && (
        <div className="flex justify-center gap-2 overflow-x-auto py-2 scrollbar-hide">
          {processedImages.map((image, index) => {
            const status = imageStatuses[index];
            if (!status?.isValid) return null;

            return (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 flex-shrink-0 ${
                  index === selectedImageIndex
                    ? "ring-2 ring-blue-400 scale-105 border border-blue-200"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={getImageAlt(image, index)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Hide Scrollbar Styling */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductGallery;
