import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const TestimonialSection = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah M.",
      content: t("home.testimonials.sarah"),
      role: "VIP Client",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Alex K.",
      content: t("home.testimonials.alex"),
      role: "Collector",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "James L.",
      content: t("home.testimonials.james"),
      role: "Entrepreneur",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Maria R.",
      content: t("home.testimonials.maria"),
      role: "Fashion Designer",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1551292831-023188e78222?q=80&w=200&auto=format&fit=crop",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("home.testimonials.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The experiences of our distinguished clients reflect our commitment
            to excellence
          </p>
          <div className="h-0.5 w-16 bg-amber-500 mx-auto mt-6"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="flex-shrink-0 w-full">
                    <div className="bg-white p-12 shadow-lg border-l-2 border-amber-400 text-center max-w-3xl mx-auto">
                      <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden border-2 border-amber-200 p-1">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex items-center justify-center mb-6">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <span key={i} className="text-amber-500 text-xl">
                              ★
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-gray-700 text-lg italic mb-8 leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="font-semibold text-gray-900 text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-amber-600 text-sm uppercase tracking-wider">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation indicators */}
            <div className="flex justify-center mt-10">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-3 h-3 mx-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "bg-amber-500 w-8" : "bg-gray-300"
                  }`}
                  aria-label={`View testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
