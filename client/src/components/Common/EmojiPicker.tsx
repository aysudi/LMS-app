import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import { FaRegSmile, FaImages } from "react-icons/fa";
import { GiphyFetch } from "@giphy/js-fetch-api";

interface EmojiAndStickerPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const gf = new GiphyFetch(
  import.meta.env.VITE_GIPHY_API_KEY || "NilJDSAPFMqepFXAp3qS7A7TRc57ebIy"
);

const EmojiAndStickerPicker: React.FC<EmojiAndStickerPickerProps> = ({
  onEmojiSelect,
  onStickerSelect,
  isOpen,
  onClose,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"emoji" | "sticker">("emoji");
  const [stickers, setStickers] = useState<any[]>([]);
  const [stickerSearch, setStickerSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  const handleStickerClick = (gif: any) => {
    // Send the GIF URL as sticker
    onStickerSelect(gif.images.fixed_height_small.url);
    onClose();
  };

  // Fetch stickers from Giphy
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        let result;
        if (stickerSearch.trim()) {
          result = await gf.search(stickerSearch, {
            limit: 20,
            type: "stickers",
          });
        } else {
          result = await gf.trending({ limit: 20, type: "stickers" });
        }
        setStickers(result.data);
      } catch (error) {
        console.error("Error fetching stickers:", error);
        // Fallback to simple emoji stickers
        const fallbackStickers = [
          "🐱",
          "🐶",
          "🐼",
          "🐻",
          "🐰",
          "🦊",
          "👍",
          "❤️",
          "👏",
          "🔥",
          "⭐",
          "💯",
          "😎",
          "🎉",
          "💝",
          "🚀",
        ];
        setStickers(
          fallbackStickers.map((emoji) => ({
            images: {
              fixed_height_small: {
                url: `data:text/plain;charset=utf-8,${emoji}`,
              },
            },
          }))
        );
      }
    };

    if (activeTab === "sticker" && isOpen) {
      fetchStickers();
    }
  }, [activeTab, stickerSearch, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("emoji")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "emoji"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaRegSmile />
            Emojis
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "sticker"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaImages />
            Stickers
          </button>
        </div>

        {/* Content */}
        <div className="p-2">
          {activeTab === "emoji" ? (
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={350}
              height={400}
              searchDisabled={false}
              previewConfig={{
                showPreview: false,
              }}
            />
          ) : (
            <div className="w-80 h-64 overflow-y-auto">
              {/* Search bar for stickers */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search stickers..."
                  value={stickerSearch}
                  onChange={(e) => setStickerSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 p-2">
                {stickers.map((gif: any, index: number) => (
                  <button
                    key={gif.id || index}
                    onClick={() => handleStickerClick(gif)}
                    className="w-16 h-16 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="button"
                  >
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title || `Sticker ${index + 1}`}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        // Fallback for broken GIF images
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiAndStickerPicker;
