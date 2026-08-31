import * as DocumentPicker from "expo-document-picker";
import { SelectedFile } from "../../types/file";
import { getFileSizeAsync } from "../fileUtils";

export const MAX_PDF_COUNT = 10;

export async function pickPDFs(currentCount: number = 0): Promise<SelectedFile[]> {
  const maxAllowed = Math.max(0, MAX_PDF_COUNT - currentCount);
  if (maxAllowed <= 0) {
    return [];
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets) {
    return [];
  }

  // Respect maximum count limit
  const assetsToTake = result.assets.slice(0, maxAllowed);

  const files: SelectedFile[] = await Promise.all(
    assetsToTake.map(async (asset, index) => {
      let size = asset.size;
      if (!size) {
        size = await getFileSizeAsync(asset.uri);
      }
      const rawName =
        asset.name ||
        asset.uri.split("/").pop() ||
        `document_${Date.now()}_${index}.pdf`;

      return {
        id: `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        uri: asset.uri,
        name: rawName,
        size,
        type: "pdf",
        mimeType: "application/pdf",
      };
    })
  );

  return files;
}

