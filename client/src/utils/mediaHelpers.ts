/**
 * Helper functions for handling media objects in Course interface
 */

export const getImageUrl = (image: string | { url: string; publicId: string; file?: File } | undefined): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};

export const getVideoUrl = (video: string | { url: string; publicId: string; file?: File } | undefined): string => {
  if (!video) return '';
  if (typeof video === 'string') return video;
  return video.url || '';
};
