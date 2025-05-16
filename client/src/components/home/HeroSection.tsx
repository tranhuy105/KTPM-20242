import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Luxury product images - updated with high-impact luxury images
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1594969155368-f19485a9d88c?q=80&w=2940&auto=format&fit=crop",
      alt: "Luxury watches collection",
    },
    {
      image:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop",
      alt: "High-end jewelry",
    },
    {
      image:
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2940&auto=format&fit=crop",
      alt: "Designer perfume",
    },
    {
      image:
        "https://images.unsplash.com/photo-1506169894395-36397e4aaee4?q=80&w=2940&auto=format&fit=crop",
      alt: "Luxury accessories",
    },
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[125vh] overflow-hidden bg-gradient-to-b from-gray-100 to-white">
      {/* Background slides with fade transition */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <div className="md:w-1/2 z-10 md:pr-12 mb-8 md:mb-0 bg-black/30 backdrop-blur-sm p-8 rounded-lg text-white">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tighter">
              {t("home.hero.title1")} <br />
              {t("home.hero.title2")} <br />
              <span className="text-amber-400">{t("home.hero.title3")}</span>
            </h1>
            <p className="text-gray-100 mb-8 max-w-lg text-lg">
              {t("home.hero.subtitle")}
            </p>
            <Link
              to="/products"
              className="bg-amber-500 hover:bg-amber-600 text-black px-10 py-4 rounded-none font-medium transition-colors inline-flex items-center group text-lg"
            >
              {t("home.hero.shopNow")}
              <svg
                className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-amber-500"
                  : "bg-white hover:bg-amber-200"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
