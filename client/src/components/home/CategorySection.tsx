import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CategorySection = () => {
  const { t } = useTranslation();

  // Using 4 main luxury categories from seedData.js
  const categories = [
    {
      name: "Đồng Hồ Cao Cấp",
      image:
        "https://images.unsplash.com/photo-1637587510640-c62792887407?q=80&w=2940&auto=format&fit=crop",
      slug: "dong-ho-cao-cap",
    },
    {
      name: "Trang Sức",
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2940&auto=format&fit=crop",
      slug: "trang-suc",
    },
    {
      name: "Túi Xách & Ví",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2940&auto=format&fit=crop",
      slug: "tui-xach-vi",
    },
    {
      name: "Nước Hoa",
      image:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2940&auto=format&fit=crop",
      slug: "nuoc-hoa",
    },
  ];

  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("home.categories.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t("home.categories.subtitle")}
          </p>
          <div className="h-0.5 w-24 bg-amber-500 mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/categories/${category.slug}`}
              className="relative overflow-hidden group transition-all duration-500 shadow-lg hover:shadow-xl"
            >
              <div className="aspect-w-3 aspect-h-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 filter group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-0 group-hover:translate-y-[-8px] transition-transform duration-300">
                    <h3 className="text-white text-2xl font-semibold mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-amber-400 text-sm uppercase tracking-wider font-medium">
                        {t("home.categories.exploreCollection")}
                      </span>
                      <svg
                        className="w-5 h-5 ml-2 text-amber-400 transform group-hover:translate-x-2 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
