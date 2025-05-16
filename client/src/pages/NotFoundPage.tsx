import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
