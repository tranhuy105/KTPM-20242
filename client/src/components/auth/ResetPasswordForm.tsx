import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaLock } from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";

const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    if (!token) {
      setError("Invalid reset token.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(token, formData.password);
      toast.success(t("auth.resetPassword.success"));
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate("/auth");
      }, 500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "error" in err
          ? String((err as { error: unknown }).error)
          : "Failed to reset password. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">
        {t("auth.resetPassword.title")}
      </h2>
      <p className="text-gray-600 mb-6">
        {t("auth.resetPassword.instructions")}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t("auth.resetPassword.newPassword")}
            required
            minLength={6}
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
            placeholder={t("auth.resetPassword.confirmPassword")}
            required
            className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
              !passwordsMatch ? "border-red-500" : "border-gray-300"
            }`}
          />
          {!passwordsMatch && (
            <p className="text-red-500 text-xs mt-1">
              {t("auth.resetPassword.passwordsDoNotMatch")}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70"
        >
          {loading
            ? t("auth.resetPassword.resetting")
            : t("auth.resetPassword.resetPassword")}
        </button>

        <div className="text-center mt-4">
          <Link to="/auth" className="text-sm text-black underline">
            {t("auth.resetPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
