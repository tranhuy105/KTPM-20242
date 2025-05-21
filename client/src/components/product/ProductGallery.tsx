import { useState, useEffect, useCallback } from "react";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

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

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
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
        // If a is default and b is not, a comes first
        if (a.isDefault && !b.isDefault) return -1;
        // If b is default and a is not, b comes first
        if (!a.isDefault && b.isDefault) return 1;
      } else if (typeof a !== "string" && a.isDefault) {
        // If a is an object with isDefault true, it comes first
        return -1;
      } else if (typeof b !== "string" && b.isDefault) {
        // If b is an object with isDefault true, it comes first
        return 1;
      }
      // Otherwise, maintain original order
      return 0;
    });

  // Preload images
  useEffect(() => {
    if (!processedImages.length) return;

    let loadedCount = 0;
    setIsLoading(true);

    processedImages.forEach((img) => {
      const imgEl = new Image();
      imgEl.src = getImageUrl(img);
      imgEl.onload = imgEl.onerror = () => {
        loadedCount++;
        if (loadedCount === processedImages.length) setIsLoading(false);
      };
    });
  }, [processedImages]);

  // Handle zoom effect with bounds checking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    // Calculate position in percentage (0-100)
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    // Clamp the values between 0 and 100
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setZoomPosition({ x, y });
  }, []);

  // Navigation
  const goToPrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) =>
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  if (!processedImages.length) {
    return (
      <div className="flex items-center justify-center h-[550px] bg-white border border-gray-200 rounded-2xl">
        <p className="text-gray-600 font-semibold text-lg">
          No images available
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Main Image Container */}
      <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 hover:scale-[1.01] transition-transform duration-200">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
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
          <img
            src={getImageUrl(processedImages[selectedImageIndex])}
            alt={getImageAlt(
              processedImages[selectedImageIndex],
              selectedImageIndex
            )}
            className={`w-full h-full object-contain p-6 transition-opacity duration-500 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Zoom Square with boundary protection */}
          {showZoom && !isLoading && (
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
        {processedImages.length > 1 && !isLoading && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2.5 rounded-full hover:scale-110 transition-transform duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2.5 rounded-full hover:scale-110 transition-transform duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Zoom Hint */}
        {!isLoading && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-1 flex items-center text-xs text-gray-600 border border-gray-200">
            <ZoomIn className="w-3.5 h-3.5 mr-1" />
            Hover to zoom
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {processedImages.length > 1 && !isLoading && (
        <div className="flex justify-center gap-2 overflow-x-auto py-2 scrollbar-hide">
          {processedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
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
              />
            </button>
          ))}
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
