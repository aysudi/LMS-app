import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../Common/LanguageSwitcher";

const AuthButtons: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-3">
      <LanguageSwitcher />
      <Link
        to="/auth/login"
        className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
      >
        {t("common.logIn")}
      </Link>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to="/auth/register"
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
        >
          {t("common.signUp")}
        </Link>
      </motion.div>
    </div>
  );
};

export default AuthButtons;
