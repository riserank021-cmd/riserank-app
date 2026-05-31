/**
 * upload.service.ts — image upload helpers.
 *
 * Uses react-native-image-picker to select from the camera roll or camera,
 * then sends a multipart/form-data POST to the backend upload endpoint.
 */

import { apiClient } from '../api/client';

export interface UploadResult {
  url: string;
}

// ── Launch image picker ───────────────────────────────────────────────────────

export interface ImageAsset {
  uri: string;
  type: string;
  fileName: string;
}

export async function pickImage(): Promise<ImageAsset | null> {
  try {
    const { launchImageLibrary } = await import('react-native-image-picker');

    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 800,
          maxHeight: 800,
          includeBase64: false,
        },
        (response) => {
          if (response.didCancel || response.errorCode || !response.assets?.length) {
            resolve(null);
            return;
          }
          const asset = response.assets[0];
          resolve({
            uri: asset.uri!,
            type: asset.type ?? 'image/jpeg',
            fileName: asset.fileName ?? 'avatar.jpg',
          });
        }
      );
    });
  } catch {
    // react-native-image-picker not installed
    return null;
  }
}

// ── Upload avatar ─────────────────────────────────────────────────────────────

export async function uploadAvatar(image: ImageAsset): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', {
    uri: image.uri,
    type: image.type,
    name: image.fileName,
  } as any);

  const { data } = await apiClient.post<{ data: { url: string } }>(
    '/upload/avatar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30_000, // longer timeout for file uploads
    }
  );

  return data.data.url;
}
