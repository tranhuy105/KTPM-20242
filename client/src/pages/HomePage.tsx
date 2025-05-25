import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import BrandsSection from "../components/home/BrandsSection";
import ProductSection from "../components/home/ProductSection";
import CategorySection from "../components/home/CategorySection";
import TestimonialSection from "../components/home/TestimonialSection";
import { useTranslation } from "react-i18next";
import productApi from "../api/productApi";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50">
      <HeroSection />
      <CategorySection />

      {/* New Arrivals Section */}
      <ProductSection
        title={t("home.newArrivals.title")}
        viewAllLink="/products"
        fetchProducts={productApi.getNewArrivals}
      />

      {/* Top Selling Section */}
      <ProductSection
        title={t("home.topSelling.title")}
        viewAllLink="/products"
        fetchProducts={productApi.getBestSellers}
      />

      <BrandsSection />
      <StatsSection />
      <TestimonialSection />
    </div>
  );
};

export default HomePage;
