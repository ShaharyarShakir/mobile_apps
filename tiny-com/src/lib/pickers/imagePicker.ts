import * as ImagePicker from "expo-image-picker";
import { SelectedFile } from "../../types/file";
import { getFileSizeAsync } from "../fileUtils";

export const MAX_IMAGE_COUNT = 20;

export async function pickImages(currentCount: number = 0): Promise<SelectedFile[]> {
  const maxAllowed = Math.max(0, MAX_IMAGE_COUNT - currentCount);
  if (maxAllowed <= 0) {
    return [];
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("MEDIA_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: maxAllowed,
    quality: 1,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  const files: SelectedFile[] = await Promise.all(
    result.assets.map(async (asset, index) => {
      let size = asset.fileSize;
      if (!size) {
        size = await getFileSizeAsync(asset.uri);
      }
      const rawName =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `image_${Date.now()}_${index}.jpg`;

      return {
        id:
          asset.assetId ||
          `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        uri: asset.uri,
        name: rawName,
        size,
        type: "image",
        mimeType: asset.mimeType || "image/jpeg",
      };
    })
  );

  return files;
}

