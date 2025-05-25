import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = () => {
  const { register, error } = useAuthContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check if passwords match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordsMatch(
          value === formData.confirmPassword || formData.confirmPassword === ""
        );
      } else {
        setPasswordsMatch(value === formData.password);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      // Redirect is handled by ProtectedRoute
    } catch {
      // Error is handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t("auth.register.title")}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={t("auth.register.username")}
            required
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("auth.register.email")}
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
            placeholder={t("auth.register.password")}
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
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t("auth.register.confirmPassword")}
            required
            className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
              !passwordsMatch ? "border-red-500" : "border-gray-300"
            }`}
          />
          {!passwordsMatch && (
            <p className="text-red-500 text-xs mt-1">
              {t("auth.register.passwordsDoNotMatch")}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="terms" className="mr-2 h-4 w-4" required />
          <label htmlFor="terms" className="text-sm text-gray-600">
            {t("auth.register.termsAgreement")}{" "}
            <a href="#" className="underline text-black">
              {t("auth.register.termsAndConditions")}
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70"
        >
          {loading
            ? t("auth.register.creatingAccount")
            : t("auth.register.createAccount")}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
