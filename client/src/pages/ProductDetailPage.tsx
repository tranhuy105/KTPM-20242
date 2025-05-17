import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import productApi from "../api/productApi";
import type { Product } from "../types";

// Component imports
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductVariantSelector from "../components/product/ProductVariantSelector";
import ProductReviews from "../components/product/ProductReviews";
import RelatedProducts from "../components/product/RelatedProducts";
import Breadcrumb from "../components/common/Breadcrumb";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("details");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!slug) {
          throw new Error("Product slug is required");
        }

        const productData = await productApi.getProductBySlug(slug);
        setProduct(productData);

        // Set default variant if product has variants
        if (
          productData.hasVariants &&
          productData.variants &&
          productData.variants.length > 0
        ) {
          setSelectedVariant(productData.variants[0]._id);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(t("products.errors.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, t]);

  // Get the selected variant object
  const getSelectedVariantObject = () => {
    if (!product || !product.variants || !selectedVariant) return null;
    return (
      product.variants.find((variant) => variant._id === selectedVariant) ||
      null
    );
  };

  // Handle variant selection
  const handleVariantChange = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  // Scroll to a section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // Update document title when product changes
  useEffect(() => {
    if (product) {
      document.title = product.seo?.title || product.name;

      // Also update meta description if exists
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription && product.seo?.description) {
        metaDescription.setAttribute("content", product.seo.description);
      }
    }
  }, [product]);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["details", "description", "reviews"];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-amber-50">
        <div className="text-center">
          <LoadingSpinner size="lg" color="amber" />
          <p className="mt-4 text-amber-800 font-medium animate-pulse">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-amber-100">
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-amber-500 mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-2xl font-serif font-medium text-gray-800 mb-2">
              {t("products.errors.notFound")}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || t("products.errors.generic")}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-amber-600 to-amber-800 text-white py-3 px-6 rounded-full hover:from-amber-700 hover:to-amber-900 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              {t("common.goBack")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedVariantObj = getSelectedVariantObject();

  // Hero image for background
  const heroImage =
    product.images && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0].url
      : "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with product image background */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
              {product.name}
            </h1>
            <p className="text-amber-200 text-xl mb-6">
              {typeof product.category === "object"
                ? product.category.name
                : product.categoryName || t("products.uncategorized")}
            </p>

            {/* Display product tags in hero section */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Display price in hero section */}
            <div className="flex items-center">
              <span className="text-white text-2xl font-medium mr-2">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-amber-300 line-through text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(product.compareAtPrice)}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            <button
              onClick={() => scrollToSection("details")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSection === "details"
                  ? "text-amber-800 border-b-2 border-amber-600"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              {t("products.details")}
            </button>
            <button
              onClick={() => scrollToSection("description")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSection === "description"
                  ? "text-amber-800 border-b-2 border-amber-600"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              {t("products.description")}
            </button>
            <button
              onClick={() => scrollToSection("reviews")}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSection === "reviews"
                  ? "text-amber-800 border-b-2 border-amber-600"
                  : "text-gray-500 hover:text-amber-600"
              }`}
            >
              {t("products.reviews.title")}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: t("common.home"), path: "/" },
                {
                  label: t("products.products"),
                  path: "/products",
                },
                ...(typeof product.category === "object" &&
                product.category.ancestors
                  ? product.category.ancestors.map((ancestor) => ({
                      label: ancestor.name,
                      path: `/products?category=${ancestor._id}`,
                    }))
                  : []),
                {
                  label:
                    typeof product.category === "object"
                      ? product.category.name
                      : product.categoryName || t("products.uncategorized"),
                  path: `/products?category=${
                    typeof product.category === "object"
                      ? product.category._id
                      : ""
                  }`,
                },
                { label: product.name, path: `/products/${product.slug}` },
              ]}
            />
          </div>

          {/* Main product section */}
          <section id="details" className="mb-24 scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Gallery */}
              <div className="bg-white rounded-lg shadow-xl">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>

              {/* Product Information */}
              <div className="bg-white">
                <ProductInfo
                  product={product}
                  selectedVariant={selectedVariantObj}
                />
              </div>
            </div>

            {/* Product Variant Selector */}
            {product.hasVariants &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="mt-12 bg-gradient-to-br from-amber-50 to-white p-8 rounded-lg shadow-lg">
                  <ProductVariantSelector
                    variants={product.variants}
                    selectedVariantId={selectedVariant}
                    onVariantChange={handleVariantChange}
                  />
                </div>
              )}
          </section>

          {/* Product Description Section */}
          <section id="description" className="mb-24 scroll-mt-24">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <ProductDescription
                description={product.description || ""}
                attributes={product.attributes}
              />
            </div>
          </section>

          {/* Product Reviews Section */}
          <section id="reviews" className="mb-24 scroll-mt-24">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <ProductReviews
                reviews={product.reviews || []}
                productId={product._id}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount}
              />
            </div>
          </section>
        </div>

        {/* Related Products */}
        <div className="bg-gradient-to-b from-amber-50 to-white py-16">
          <div className="container mx-auto px-4">
            <RelatedProducts productId={product._id} />
          </div>
        </div>

        {/* Footer Banner */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl italic mb-6">
              {t("products.luxuryExperience")}
            </h2>
            <p className="max-w-2xl mx-auto text-amber-100 mb-8">
              {product.shortDescription}
            </p>
            <button
              onClick={() => scrollToSection("details")}
              className="bg-white text-amber-800 px-8 py-3 rounded-full font-medium hover:bg-amber-100 transition-colors shadow-lg"
            >
              {t("products.shopNow")}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbars */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
