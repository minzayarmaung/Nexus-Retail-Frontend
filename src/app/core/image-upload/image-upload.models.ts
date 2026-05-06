/** Credentials returned by your backend for ImageKit client-side upload. */
export interface ImageKitAuthCredentials {
  token: string;
  signature: string;
  expire: number;
}

/** ImageKit upload API success body (subset). */
export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
}

export const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
