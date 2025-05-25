import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { t } = useTranslation();

  // Set document title manually
  useEffect(() => {
    document.title = `${t("auth.resetPassword.pageTitle")} | Luxury Shop`;
    return () => {
      document.title = "Luxury Shop";
    };
  }, [t]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
