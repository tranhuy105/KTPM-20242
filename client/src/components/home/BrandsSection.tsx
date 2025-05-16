import { useState, useEffect } from "react";

const BrandsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Refined list of luxury brands with monogram options
  const brands = [
    {
      name: "Cartier",
      logo: "CARTIER",
      monogram: "C",
      tagline: "Art of Fine Jewelry Since 1847",
    },
    {
      name: "Rolex",
      logo: "ROLEX",
      monogram: "R",
      tagline: "Timeless Precision & Elegance",
    },
    {
      name: "Louis Vuitton",
      logo: "LOUIS VUITTON",
      monogram: "LV",
      tagline: "The Art of Travel Since 1854",
    },
    {
      name: "Dior",
      logo: "DIOR",
      monogram: "CD",
      tagline: "The House of Dreams",
    },
    {
      name: "Chanel",
      logo: "CHANEL",
      monogram: "CC",
      tagline: "Luxury Embodied Since 1910",
    },
    {
      name: "Hermès",
      logo: "HERMÈS",
      monogram: "H",
      tagline: "Craftsmanship Beyond Compare",
    },
    {
      name: "Bvlgari",
      logo: "BVLGARI",
      monogram: "B",
      tagline: "Italian Excellence & Heritage",
    },
    {
      name: "Gucci",
      logo: "GUCCI",
      monogram: "GG",
      tagline: "Defining Luxury for a Century",
    },
    {
      name: "Balenciaga",
      logo: "BALENCIAGA",
      monogram: "B",
      tagline: "Bold Vision of Modern Luxury",
    },
  ];

  // Auto-rotate through brands when not hovering
  useEffect(() => {
    let interval;
    if (!isHovering) {
      interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % brands.length);
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [brands.length, isHovering]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-24 border-t border-b border-gray-200">
      <div className="container mx-auto px-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-amber-400 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-amber-400 opacity-40"></div>

        <div className="text-center mb-16 relative">
          <h2 className="text-3xl font-serif tracking-wide text-gray-800 mb-2">
            DISTINGUISHED PARTNERSHIPS
          </h2>
          <p className="text-gray-500 italic font-light mb-4">
            Curated excellence from the world's most prestigious maisons
          </p>
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
        </div>

        <div
          className="flex flex-wrap justify-center items-center max-w-6xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {brands.map((brand, index) => (
            <div
              key={index}
              className={`px-6 sm:px-8 py-6 mb-8 text-center transition-all duration-500 ease-out ${
                index === activeIndex ? "scale-110" : "scale-100 opacity-60"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="relative mb-3">
                <div
                  className={`absolute -top-6 left-1/2 transform -translate-x-1/2 font-serif text-5xl text-amber-300 opacity-10 transition-opacity duration-500 ${
                    index === activeIndex ? "opacity-20" : "opacity-0"
                  }`}
                >
                  {brand.monogram}
                </div>
              </div>

              <div
                className={`font-serif text-xl md:text-2xl xl:text-3xl tracking-widest ${
                  index === activeIndex
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 font-light"
                } transition-all duration-500 ease-out`}
              >
                {brand.logo}
                <div
                  className={`h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2 transition-all duration-500 ease-out ${
                    index === activeIndex ? "w-full" : "w-0"
                  }`}
                ></div>
              </div>

              {index === activeIndex && (
                <div className="mt-3 text-xs font-light text-gray-500 tracking-wider uppercase opacity-0 animate-fade-in">
                  {brand.tagline}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <div className="flex space-x-3">
            {brands.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-amber-400 w-6"
                    : "bg-gray-300 hover:bg-amber-200"
                }`}
                aria-label={`View ${brands[index].name}`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="inline-flex items-center px-8 py-3 border border-amber-400 text-xs tracking-widest uppercase text-gray-700 hover:bg-amber-50 transition-colors duration-300">
            <span className="mr-2">Explore Our Collections</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const BrandsSectionWithStyles = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
      <BrandsSection />
    </>
  );
};

export default BrandsSectionWithStyles;
