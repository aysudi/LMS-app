import { motion } from "framer-motion";

const VideoModal: React.FC<{ videoUrl: string; onClose: () => void }> = ({
  videoUrl,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full aspect-video shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-lg font-bold">×</span>
          </button>

          {/* Video Player */}
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoModal;
