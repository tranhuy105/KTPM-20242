import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

const StatsSection = () => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [animatedValues, setAnimatedValues] = useState({
    brands: 0,
    products: 0,
    customers: 0,
  });

  const targetValues = {
    brands: 200,
    products: 2000,
    customers: 30000,
  };

  useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds for animation
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        setAnimatedValues({
          brands: Math.floor(progress * targetValues.brands),
          products: Math.floor(progress * targetValues.products),
          customers: Math.floor(progress * targetValues.customers),
        });

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [inView]);

  const stats = [
    {
      value: animatedValues.brands + "+",
      label: t("home.stats.brands"),
      icon: (
        <svg
          className="w-8 h-8 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
        </svg>
      ),
    },
    {
      value: animatedValues.products + "+",
      label: t("home.stats.highQualityProducts"),
      icon: (
        <svg
          className="w-8 h-8 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
        </svg>
      ),
    },
    {
      value: animatedValues.customers + "+",
      label: t("home.stats.happyCustomers"),
      icon: (
        <svg
          className="w-8 h-8 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 17v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div ref={ref} className="bg-white py-24 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            EXPERIENCE LUXURY BY NUMBERS
          </h2>
          <div className="h-0.5 w-16 bg-amber-500 mx-auto"></div>
        </div>

        <div className="flex flex-wrap justify-around items-center text-center max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="px-8 py-10 mb-6 transition-all duration-300 hover:shadow-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex flex-col items-center">
                {stat.icon}
                <div className="text-4xl md:text-5xl font-bold mb-3 mt-5 text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
