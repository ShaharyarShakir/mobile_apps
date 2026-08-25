import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import type { SelectedImage } from "../types/image";

export const MAX_SELECTION_LIMIT = 20;

export async function pickImages(selectionLimit = MAX_SELECTION_LIMIT): Promise<ImagePicker.ImagePickerAsset[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    showPermissionAlert();
    throw new Error("MEDIA_LIBRARY_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 1,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets;
}

export function mapSelectedImages(
  assets: ImagePicker.ImagePickerAsset[]
): SelectedImage[] {
  return assets.map((asset, index) => ({
    id: asset.assetId ?? `${asset.uri}-${Date.now()}-${index}`,
    uri: asset.uri,
    filename: asset.fileName ?? `image-${index + 1}.jpg`,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize,
  }));
}

export function showPermissionAlert() {
  Alert.alert(
    "Photos Access Needed",
    "Image Compressor needs access to your photos to compress them.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]
  );
}

