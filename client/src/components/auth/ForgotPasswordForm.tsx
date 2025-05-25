import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { z } from "zod";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";
import type { TFunction } from "i18next";

// Zod schema for email validation
const createForgotPasswordSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(3, t("auth.forgotPassword.validation.emailRequired"))
      .email(t("auth.forgotPassword.validation.emailInvalid"))
      .max(254, t("auth.forgotPassword.validation.emailTooLong")),
  });

const COOLDOWN_DURATION = 60000; // 60 seconds in milliseconds
const COOLDOWN_KEY = "forgot_password_cooldown";

const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [cooldownTime, setCooldownTime] = useState(0);

  // Get last request time from sessionStorage
  const getLastRequestTime = (): number | null => {
    try {
      const stored = sessionStorage.getItem(COOLDOWN_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  };

  // Set last request time to sessionStorage
  const setLastRequestTime = (timestamp: number) => {
    try {
      sessionStorage.setItem(COOLDOWN_KEY, timestamp.toString());
    } catch {
      // Fallback if sessionStorage is not available
    }
  };

  // Initialize cooldown time on component mount
  useEffect(() => {
    const lastRequestTime = getLastRequestTime();
    if (lastRequestTime) {
      const now = Date.now();
      const timeDifference = now - lastRequestTime;
      if (timeDifference < COOLDOWN_DURATION) {
        const remaining = Math.ceil(
          (COOLDOWN_DURATION - timeDifference) / 1000
        );
        setCooldownTime(remaining);
      }
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            // Clear sessionStorage when cooldown ends
            try {
              sessionStorage.removeItem(COOLDOWN_KEY);
            } catch {
              // Ignore errors
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldownTime]);

  // Check if we're still in cooldown period
  const isInCooldown = (): boolean => {
    const lastRequestTime = getLastRequestTime();
    if (!lastRequestTime) return false;
    const now = Date.now();
    const timeDifference = now - lastRequestTime;
    return timeDifference < COOLDOWN_DURATION;
  };

  // Calculate remaining cooldown time
  const getRemainingCooldownTime = (): number => {
    const lastRequestTime = getLastRequestTime();
    if (!lastRequestTime) return 0;
    const now = Date.now();
    const timeDifference = now - lastRequestTime;
    return Math.max(0, Math.ceil((COOLDOWN_DURATION - timeDifference) / 1000));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    try {
      const forgotPasswordSchema = createForgotPasswordSchema(t);
      forgotPasswordSchema.parse({ email });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
      return;
    }

    // Check cooldown
    if (isInCooldown()) {
      const remaining = getRemainingCooldownTime();
      const errorMessage = t("auth.forgotPassword.cooldown.waitMessage", {
        seconds: remaining,
      });
      setError(errorMessage);
      toast.error(errorMessage);
      setCooldownTime(remaining); // Update UI cooldown time
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);

      // Set cooldown
      const now = Date.now();
      setLastRequestTime(now);
      setCooldownTime(60);

      toast.success(t("auth.forgotPassword.success.emailSent"));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "error" in err
          ? String((err as { error: unknown }).error)
          : "Failed to process request. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setEmail("");
    setError(null);
    setValidationErrors({});
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {t("auth.forgotPassword.checkEmail")}
        </h2>
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
          <p>{t("auth.forgotPassword.emailSent")}</p>
          <p className="mt-2 text-sm">{t("auth.forgotPassword.checkSpam")}</p>
        </div>
        <p className="mb-6">{t("auth.forgotPassword.followInstructions")}</p>

        {cooldownTime > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            <p className="text-sm">
              {t("auth.forgotPassword.cooldown.nextRequestIn", {
                seconds: cooldownTime,
              })}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Link to="/auth" className="text-sm text-black underline">
            {t("auth.forgotPassword.backToLogin")}
          </Link>
          <button
            onClick={handleTryAgain}
            disabled={cooldownTime > 0}
            className={`text-sm ${
              cooldownTime > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {cooldownTime > 0
              ? t("auth.forgotPassword.cooldown.tryAgainIn", {
                  seconds: cooldownTime,
                })
              : t("auth.forgotPassword.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">
        {t("auth.forgotPassword.title")}
      </h2>
      <p className="text-gray-600 mb-6">
        {t("auth.forgotPassword.instructions")}
      </p>

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
            value={email}
            onChange={handleChange}
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            required
            className={`pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              validationErrors.email
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-black focus:border-black"
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || cooldownTime > 0}
          className={`w-full p-3 rounded-lg font-medium transition-colors ${
            loading || cooldownTime > 0
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {loading
            ? t("auth.forgotPassword.sending")
            : cooldownTime > 0
            ? t("auth.forgotPassword.cooldown.waitSeconds", {
                seconds: cooldownTime,
              })
            : t("auth.forgotPassword.sendLink")}
        </button>

        {cooldownTime > 0 && !loading && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t("auth.forgotPassword.cooldown.pleaseWait", {
                seconds: cooldownTime,
              })}
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/auth" className="text-sm text-black underline">
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;