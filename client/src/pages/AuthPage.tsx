import { useState } from "react";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="max-w-md mx-auto">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 font-medium ${
            activeTab === "login"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 font-medium ${
            activeTab === "register"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>

      <div className="mt-8">
        {activeTab === "login" ? (
          <div>
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            <div>Login form placeholder</div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-6">Register</h1>
            <div>Registration form placeholder</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
