import { useAuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    // No need to redirect, ProtectedRoute will handle it
  };

  if (!user) {
    return <div>Loading profile information...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-black text-white p-6">
          <h1 className="text-2xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-300">Manage your account information</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Username
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {user.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">{user.email}</div>
              </div>
              {user.fullName && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {user.fullName}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Role
                </label>
                <div className="p-3 bg-gray-100 rounded-lg capitalize">
                  {user.role || "customer"}
                  {user.isAdmin && " (Admin)"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Member Since
                </label>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {new Date(user.createdAt || "").toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <div className="p-3 bg-gray-100 rounded-lg flex items-center">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      user.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {user.isActive ? "Active" : "Inactive"}
                  {user.isVerified && ", Verified"}
                </div>
              </div>
            </div>
          </div>

          {user.preferences && (
            <div className="mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Language
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {user.preferences.language || "English"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Currency
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {user.preferences.currency || "USD"}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Notifications
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {user.preferences.notifications?.email
                      ? "Email notifications enabled"
                      : "Email notifications disabled"}
                    <br />
                    {user.preferences.notifications?.marketing
                      ? "Marketing emails enabled"
                      : "Marketing emails disabled"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.customerData && (
            <div className="mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Total Orders
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {user.customerData.orderCount || 0}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Total Spent
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    ${user.customerData.totalSpent?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <button
              onClick={handleLogout}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
