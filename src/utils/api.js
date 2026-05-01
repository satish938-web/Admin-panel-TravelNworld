// src/utils/api.js

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
export const PUBLIC_FRONTEND_URL = import.meta.env.VITE_PUBLIC_FRONTEND_URL || "http://localhost:5173";

export const S3_BASE_URL = "https://travel-n-wolrd.s3.ap-south-1.amazonaws.com";

/**
 * Transforms a source string (S3 key or URL) into a full public URL.
 * @param {string} src - The image/video source (S3 key or absolute URL).
 * @returns {string} - The absolute URL to the resource.
 */
export const getImageUrl = (src) => {
  if (!src) return "";
  // If it's already an absolute URL (starts with http), return it as is
  if (typeof src === 'string' && (src.startsWith("http://") || src.startsWith("https://"))) {
    return src;
  }
  // Otherwise, assume it's an S3 key and prepend the base URL
  // Remove leading slash if present to avoid double slashes
  const cleanKey = src.startsWith("/") ? src.substring(1) : src;
  return `${S3_BASE_URL}/${cleanKey}`;
};
