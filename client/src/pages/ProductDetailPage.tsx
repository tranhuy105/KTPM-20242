import { useParams, useLocation } from "react-router-dom";

const ProductDetailPage = () => {
  const { slug, id } = useParams();
  const location = useLocation();
  const isIdRoute = location.pathname.includes("/products/id/");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product Detail</h1>
      {isIdRoute ? (
        <p className="text-lg">Product ID: {id}</p>
      ) : (
        <p className="text-lg">Product slug: {slug}</p>
      )}
    </div>
  );
};

export default ProductDetailPage;
