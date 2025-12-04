import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Logo: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 cursor-pointer"
      onClick={() => navigate("/")}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 lg:p-3 rounded-xl shadow-lg">
        <FaGraduationCap className="text-white text-xl" />
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Skillify
        </h1>
        <p className="text-xs text-gray-500 hidden lg:block">
          {t("common.learnGrowExcel")}
        </p>
      </div>
    </motion.div>
  );
};

export default Logo;
