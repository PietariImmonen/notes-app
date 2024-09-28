import { storage } from "@/configs/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type MediaType = "video" | "image" | "file";

export const uploadMedia = async (
  file: File,
  mediaType: MediaType,
): Promise<{ secure_url: string; width?: number; height?: number }> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const directory = `${mediaType}s`;
  const storageRef = ref(storage, `${directory}/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    if (mediaType === "image" || mediaType === "video") {
      const img = new Image();
      img.src = downloadURL;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      return {
        secure_url: downloadURL,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    } else {
      return {
        secure_url: downloadURL,
      };
    }
  } catch (error) {
    console.error("Error uploading media:", error);
    throw new Error(`Failed to upload ${mediaType}`);
  }
};
