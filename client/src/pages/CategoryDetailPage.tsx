import { useParams } from "react-router-dom";

const CategoryDetailPage = () => {
  const { slug } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Category Detail</h1>
      <p className="text-lg">Category slug: {slug}</p>
    </div>
  );
};

export default CategoryDetailPage;
