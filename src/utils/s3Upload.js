import axios from "axios";
import { API_BASE } from "./api";

/**
 * Upload a file to S3 using a presigned URL (PUT)
 * @param {File} file - The file object from input
 * @param {string} folder - Destination folder (e.g., 'blogs', 'itineraries')
 * @returns {Promise<string>} - The S3 object key to be stored in DB
 */
export const uploadToS3 = async (file, folder = "uploads", customFileName = null) => {
  const token = localStorage.getItem("token");
  
  const fileNameToUse = customFileName || file.name;

  try {
    console.log(`Requesting upload URL for: ${fileNameToUse} in folder: ${folder}`);
    
    // 1. Get presigned URL and fileKey from backend
    const { data } = await axios.post(
      `${API_BASE}/api/upload/presigned-url`,
      {
        fileName: fileNameToUse,
        fileType: file.type,
        folder: folder,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { uploadUrl, fileKey } = data;
    console.log("Got presigned URL. Starting direct upload to S3...");

    // 2. Upload file directly to S3 using PUT
    // We use axios.put or fetch. axios is already imported.
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("Upload successful! Key:", fileKey);
    return fileKey; // Return only the key for DB storage
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
