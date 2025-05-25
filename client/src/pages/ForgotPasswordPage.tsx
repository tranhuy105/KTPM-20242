import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  // Set document title manually
  useEffect(() => {
    document.title = `${t("auth.forgotPassword.pageTitle")} | Luxury Shop`;
    return () => {
      document.title = "Luxury Shop";
    };
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
