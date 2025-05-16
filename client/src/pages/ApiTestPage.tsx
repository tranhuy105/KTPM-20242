import { useState } from "react";
import userApi from "../api/userApi";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import orderApi from "../api/orderApi";
import authApi from "../api/authApi";

// Component to display JSON response
const JsonDisplay = ({ data }: { data: unknown }) => {
  return (
    <div className="w-full">
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm whitespace-pre-wrap text-left border border-gray-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

const ApiTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<unknown>(null);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  console.log(responseData);

  // Generic API call handler
  const handleApiCall = async (
    apiCall: () => Promise<unknown>,
    testName: string
  ) => {
    setLoading(true);
    setError(null);
    setResponseData(null);
    setStatusCode(null);
    setActiveTest(testName);

    try {
      const response = await apiCall();
      setResponseData(response);
      setStatusCode(200);
      console.log(`${testName} response:`, response);
    } catch (err: unknown) {
      console.error(`${testName} error:`, err);

      if (err && typeof err === "object" && "response" in err) {
        const errorObj = err as {
          response?: {
            status?: number;
            data?: unknown;
          };
          message?: string;
        };

        setStatusCode(errorObj.response?.status || 500);

        // Handle different error formats
        if (errorObj.response?.data) {
          setResponseData(errorObj.response.data);
          setError(
            `${errorObj.message || "Error"} - ${
              errorObj.response.status || "Unknown status"
            }`
          );
        } else {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
        }
      } else {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // User API Tests
  const testGetUsers = () =>
    handleApiCall(() => userApi.getAllUsers(), "Get All Users");
  const testGetCurrentUser = () =>
    handleApiCall(() => authApi.getCurrentUser(), "Get Current User");
  const testGetUserById = () =>
    handleApiCall(() => userApi.getUserById("someUserId"), "Get User by ID");

  // Product API Tests
  const testGetProducts = () =>
    handleApiCall(() => productApi.getAllProducts(), "Get All Products");
  const testGetFeaturedProducts = () =>
    handleApiCall(
      () => productApi.getFeaturedProducts(),
      "Get Featured Products"
    );
  const testGetNewArrivals = () =>
    handleApiCall(() => productApi.getNewArrivals(), "Get New Arrivals");
  const testGetProductById = () =>
    handleApiCall(
      () => productApi.getProductById("682609a20c4e8bf73cec7f64"),
      "Get Product by ID"
    );
  const testGetProductBySlug = () =>
    handleApiCall(
      () => productApi.getProductBySlug("couture-io-418-limited"),
      "Get Product by Slug"
    );

  // Category API Tests
  const testGetCategories = () =>
    handleApiCall(() => categoryApi.getAllCategories(), "Get All Categories");
  const testGetCategoryChildren = () =>
    handleApiCall(
      () => categoryApi.getCategoryChildren("682609a00c4e8bf73cec6776"),
      "Get Root Categories"
    );
  const testGetCategoryById = () =>
    handleApiCall(
      () => categoryApi.getCategoryById("682609a10c4e8bf73cec67f2"),
      "Get Category by ID"
    );
  const testGetCategoryBySlug = () =>
    handleApiCall(
      () => categoryApi.getCategoryBySlug("binh-hoa"),
      "Get Category by Slug"
    );

  // Order API Tests
  const testGetOrders = () =>
    handleApiCall(() => orderApi.getAllOrders(), "Get All Orders");
  const testGetMyOrders = () =>
    handleApiCall(() => orderApi.getMyOrders(), "Get My Orders");
  const testGetOrderById = () =>
    handleApiCall(
      () => orderApi.getOrderById("someOrderId"),
      "Get Order by ID"
    );
  const testGetOrderDashboard = () =>
    handleApiCall(() => orderApi.getOrdersDashboard(), "Get Orders Dashboard");
  const testGetSalesStats = () =>
    handleApiCall(
      () => orderApi.getSalesStats("monthly"),
      "Get Monthly Sales Stats"
    );

  // Auth API Tests
  const testLogin = () =>
    handleApiCall(
      () =>
        authApi.login({
          email: "admin@luxurystore.vn",
          password: "admin123",
        }),
      "Login"
    );

  const testRegister = () =>
    handleApiCall(
      () =>
        authApi.register({
          email: "testuser@example.com",
          password: "password123",
          username: "testuser123",
        }),
      "Register"
    );

  const testUpdatePassword = () =>
    handleApiCall(
      () =>
        authApi.updatePassword("someUserId", "currentPassword", "newPassword"),
      "Update Password"
    );

  // Response Area section
  const renderResponseData = () => {
    if (!responseData) return null;
    return <JsonDisplay data={responseData} />;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Auth API Tests */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Auth API Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testLogin}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
            >
              Login
            </button>
            <button
              onClick={testRegister}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
            >
              Register
            </button>
            <button
              onClick={testGetCurrentUser}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
            >
              Get Current User
            </button>
            <button
              onClick={testUpdatePassword}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* User API Tests */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">User API Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testGetUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Get All Users
            </button>
            <button
              onClick={testGetUserById}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Get User by ID
            </button>
          </div>
        </div>

        {/* Product API Tests */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Product API Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testGetProducts}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Get All Products
            </button>
            <button
              onClick={testGetFeaturedProducts}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Get Featured Products
            </button>
            <button
              onClick={testGetNewArrivals}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Get New Arrivals
            </button>
            <button
              onClick={testGetProductById}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Get Product by ID
            </button>
            <button
              onClick={testGetProductBySlug}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Get Product by Slug
            </button>
          </div>
        </div>

        {/* Category API Tests */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Category API Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testGetCategories}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Get All Categories
            </button>
            <button
              onClick={testGetCategoryChildren}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Get Root Categories
            </button>
            <button
              onClick={testGetCategoryById}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Get Category by ID
            </button>
            <button
              onClick={testGetCategoryBySlug}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Get Category by Slug
            </button>
          </div>
        </div>

        {/* Order API Tests */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Order API Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testGetOrders}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full"
            >
              Get All Orders
            </button>
            <button
              onClick={testGetMyOrders}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full"
            >
              Get My Orders
            </button>
            <button
              onClick={testGetOrderById}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full"
            >
              Get Order by ID
            </button>
            <button
              onClick={testGetOrderDashboard}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full"
            >
              Get Orders Dashboard
            </button>
            <button
              onClick={testGetSalesStats}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 w-full"
            >
              Get Sales Stats
            </button>
          </div>
        </div>
      </div>
      {/* Response Area */}
      <div className="mt-8 border rounded-lg p-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">
            {activeTest ? `Response: ${activeTest}` : "Response"}
          </h2>
          {statusCode && (
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                statusCode >= 200 && statusCode < 300
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Status: {statusCode}
            </span>
          )}
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {renderResponseData()}
      </div>
    </div>
  );
};

export default ApiTestPage;
