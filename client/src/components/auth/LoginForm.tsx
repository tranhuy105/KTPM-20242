import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
  const { login, error } = useAuthContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  // Load saved email if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      // Redirect is handled by ProtectedRoute
    } catch {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t("auth.login.title")}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("auth.login.email")}
            required
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t("auth.login.password")}
            required
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="mr-2 h-4 w-4"
            />
            <span className="text-sm text-gray-600">
              {t("auth.login.rememberMe")}
            </span>
          </label>
          <a href="/forgot-password" className="text-sm text-black underline">
            {t("auth.login.forgotPassword")}
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
