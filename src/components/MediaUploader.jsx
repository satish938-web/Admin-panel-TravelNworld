import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { getImageUrl } from "../utils/api";

/**
 * MediaUploader — drag-and-drop photo/video uploader that streams files
 * directly to Cloudinary via the existing /api/upload/media endpoint.
 *
 * Props:
 *   existingUrls  — string[] : URLs already saved (shown as thumbnails on mount)
 *   onChange      — fn(string[]) : called with the full updated URL list after each upload/remove
 *   label         — string  : section heading
 *   maxFiles      — number  : defaults to 10
 */
const MediaUploader = ({
  existingUrls = [],
  onChange,
  label = "Photos & Videos",
  maxFiles = 10,
  folder = "media", // New prop
  baseFileName = "", // New prop: used to rename files based on title/name
  accept = "image/*,video/*", // New prop: to restrict file types
  onBusy, // New prop: notifies parent when uploading
}) => {
  const [mediaItems, setMediaItems] = useState(() =>
    existingUrls
      .filter(Boolean)
      .map((item) => {
        const url = typeof item === "string" ? item : (item.url || "");
        return { 
          url, 
          status: "done", 
          isVideo: /\.(mp4|mov|avi|webm|mkv)/i.test(String(url)) 
        };
      })
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_BASE || "";

  const notifyParent = useCallback(
    (items) => {
      onChange && onChange(items.filter((i) => i.status === "done").map((i) => i.url));
    },
    [onChange]
  );

  const uploadFiles = async (rawFiles) => {
    // Filter files based on accept prop if it's not the default
    let filteredFiles = Array.from(rawFiles);
    if (accept !== "image/*,video/*") {
      const isOnlyImages = accept.includes("image") && !accept.includes("video");
      const isOnlyVideos = accept.includes("video") && !accept.includes("image");
      
      if (isOnlyImages) {
        filteredFiles = filteredFiles.filter(f => f.type.startsWith("image/"));
      } else if (isOnlyVideos) {
        filteredFiles = filteredFiles.filter(f => f.type.startsWith("video/"));
      }
    }

    const allowed = filteredFiles.slice(0, maxFiles - mediaItems.length);
    if (allowed.length === 0) return;

    const currentCount = mediaItems.length;
    const placeholders = allowed.map((f) => ({
      url: URL.createObjectURL(f),
      status: "uploading",
      progress: 0,
      isVideo: f.type.startsWith("video/"),
      name: f.name,
    }));
    const next = [...mediaItems, ...placeholders];
    setMediaItems(next);
    setUploading(true);
    onBusy && onBusy(true);

    try {
      const { uploadToS3 } = await import("../utils/s3Upload");

      // Upload each file sequentially to avoid saturating bandwidth
      const uploadResults = [];
      for (let i = 0; i < allowed.length; i++) {
        const file = allowed[i];
        const index = i;
        const targetIdx = currentCount + index;
        
        try {
          // Determine the file name to use
          let uploadName = file.name;
          if (baseFileName) {
            const extension = file.name.split('.').pop();
            const fileIndex = currentCount + index + 1;
            const suffix = maxFiles > 1 ? `-${fileIndex}` : "";
            uploadName = `${baseFileName}${suffix}.${extension}`;
          }

          const fileUrl = await uploadToS3(file, folder, uploadName, (progress) => {
            setMediaItems(prev => {
              const updated = [...prev];
              if (updated[targetIdx]) {
                updated[targetIdx] = { ...updated[targetIdx], progress };
              }
              return updated;
            });
          });

          uploadResults.push({ index, url: fileUrl, status: "done", isVideo: file.type.startsWith("video/") });
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          uploadResults.push({ index, status: "error", isVideo: file.type.startsWith("video/"), url: URL.createObjectURL(file) });
        }
      }

      // Map the results back to the state in the correct order
      setMediaItems(prev => {
        const updated = [...prev];
        uploadResults.forEach(res => {
          const targetIdx = currentCount + res.index;
          if (updated[targetIdx]) {
            updated[targetIdx] = {
              url: res.url,
              status: res.status,
              isVideo: res.isVideo,
              progress: 100
            };
          }
        });
        return updated;
      });

      // Notify parent after all uploads in this batch are done
      // (Wait for state update to settle)
      setTimeout(() => {
        setMediaItems(current => {
          notifyParent(current);
          return current;
        });
      }, 100);

    } catch (err) {
      console.error("Upload batch failed:", err);
    } finally {
      setUploading(false);
      onBusy && onBusy(false);
    }

  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleRemove = (index) => {
    const updated = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updated);
    notifyParent(updated);
  };

  const canAddMore = mediaItems.length < maxFiles;

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Drop Zone */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors select-none
            ${isDragging ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50"}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 12l-4-4-4 4M12 8v8" />
          </svg>
          <p className="text-sm text-gray-600 font-medium">
            {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-gray-400">
            Photos (JPG, PNG, WEBP) and Videos (MP4, MOV, AVI, WEBM) · Max {maxFiles} files · 50 MB each
          </p>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-red-600 font-medium">
                  Uploading {mediaItems.filter(i => i.status === "uploading").length} file(s)…
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {mediaItems.map((item, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-black aspect-square">
              {item.isVideo ? (
                <video
                  src={getImageUrl(item.url)}
                  className="w-full h-full object-cover opacity-80"
                  muted
                />
              ) : (
                <img
                  src={getImageUrl(item.url)}
                  alt={`media-${idx}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Status overlay */}
              {item.status === "uploading" && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-white text-[10px] font-bold">{item.progress || 0}%</span>
                  <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300" 
                      style={{ width: `${item.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 bg-red-600/70 flex items-center justify-center text-white text-xs font-medium">
                  Failed
                </div>
              )}
              {/* Remove button */}
              {item.status === "done" && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                  title="Remove"
                >
                  ✕
                </button>
              )}
              {/* Video badge */}
              {item.isVideo && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  VIDEO
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">{mediaItems.filter(i => i.status === "done").length} / {maxFiles} files uploaded</p>
    </div>
  );
};

export default MediaUploader;
