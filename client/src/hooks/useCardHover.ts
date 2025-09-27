import { useState, useEffect, useRef } from "react";

export const useCardHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showOnLeft, setShowOnLeft] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const panelWidth = 320; // w-80 = 320px

        if (rect.right + panelWidth > screenWidth - 20) {
          setShowOnLeft(true);
        } else {
          setShowOnLeft(false);
        }
      }
      setIsHovered(true);
    }, 100); // 100ms delay before showing hover panel
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return {
    isHovered,
    showOnLeft,
    cardRef,
    handleMouseEnter,
    handleMouseLeave,
  };
};
