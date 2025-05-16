import { useState } from "react";
import { useTranslation } from "react-i18next";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-3 font-medium transition-colors ${
            activeTab === "login"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("login")}
        >
          {t("auth.tabs.login")}
        </button>
        <button
          className={`flex-1 py-3 font-medium transition-colors ${
            activeTab === "register"
              ? "border-b-2 border-black text-black"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("register")}
        >
          {t("auth.tabs.register")}
        </button>
      </div>

      <div className="px-4 pb-6">
        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default AuthPage;
