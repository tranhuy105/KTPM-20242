import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Luxury Shop
          </Link>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-gray-900"
            >
              Categories
            </Link>
            <Link to="/api-test" className="text-gray-600 hover:text-gray-900">
              API Test
            </Link>
            <Link to="/auth" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
