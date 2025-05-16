import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`text-sm px-2 py-1 rounded ${
          i18n.language === "vi" ? "bg-black text-white" : "bg-gray-200"
        }`}
        onClick={() => changeLanguage("vi")}
      >
        Tiếng Việt
      </button>
      <button
        className={`text-sm px-2 py-1 rounded ${
          i18n.language === "en" ? "bg-black text-white" : "bg-gray-200"
        }`}
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
