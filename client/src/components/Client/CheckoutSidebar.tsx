import React from "react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaCreditCard, FaTag } from "react-icons/fa";
import type { Course } from "../../types/course.type";
import { motion } from "framer-motion";

interface CheckoutSidebarProps {
  selectedItems: Course[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  total: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  showPromo: boolean;
  setShowPromo: (show: boolean) => void;
  onApplyPromo: () => void;
  onCheckout: () => void;
}

const CheckoutSidebar: React.FC<CheckoutSidebarProps> = ({
  selectedItems,
  subtotal,
  discount,
  discountAmount,
  total,
  promoCode,
  setPromoCode,
  showPromo,
  setShowPromo,
  onApplyPromo,
  onCheckout,
}) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-6 border border-gray-200"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {t("cart.orderSummary")}
      </h2>

      {/* Selected Items Count */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{t("cart.selectedItems")}:</span>
          <span>{selectedItems.length}</span>
        </div>
        {selectedItems.length > 0 && (
          <div className="text-xs text-blue-600">
            {selectedItems
              .map((item) => item.title)
              .join(", ")
              .substring(0, 100)}
            {selectedItems.map((item) => item.title).join(", ").length > 100 &&
              "..."}
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <FaTag className="text-xs" />
            <span>{t("cart.addPromoCode")}</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t("cart.enterPromoCode")}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={onApplyPromo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t("common.apply")}
              </button>
            </div>
            <button
              onClick={() => {
                setShowPromo(false);
                setPromoCode("");
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {t("common.cancel")}
            </button>
          </motion.div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between text-gray-600">
          <span>{t("cart.subtotal")}:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>
              {t("cart.discount")} ({discount}%):
            </span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xl font-bold text-gray-900">
          <span>{t("cart.total")}:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>{t("course.lifetimeAccess")}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>{t("cart.mobileAndTVAccess")}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FaCheckCircle className="text-xs" />
          <span>{t("course.certificateOfCompletion")}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={selectedItems.length === 0}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
      >
        <FaCreditCard className="text-lg" />
        <span>
          {selectedItems.length === 0
            ? t("cart.selectItemsToCheckout")
            : t("cart.checkoutItems", { count: selectedItems.length })}
        </span>
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        {t("cart.moneyBackGuarantee")}
      </p>
    </motion.div>
  );
};

export default CheckoutSidebar;
