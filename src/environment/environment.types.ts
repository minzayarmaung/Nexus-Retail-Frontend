export type ImageUploadProviderId = 'imagekit' | 'none';

/**
 * ImageKit client-side upload. Backend must expose `authenticationPath` that returns
 * `{ token, signature, expire }` (or wrapped in your standard `ApiResponse`).
 */
export interface ImageKitClientConfig {
  publicKey: string;
  /** Used for documentation / future transforms; ImageKit dashboard URL endpoint */
  urlEndpoint: string;
  /** Absolute URL, or path relative to `apiBaseUrl` */
  authenticationPath: string;
  folder?: string;
  uploadUrl?: string;
  useUniqueFileName?: boolean;
  /** Max width/height before upload (default 2048 in service) */
  maxUploadDimension?: number;
  jpegQuality?: number;
}

export interface ImageUploadEnv {
  provider: ImageUploadProviderId;
  imageKit?: ImageKitClientConfig;
}

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  imageUpload: ImageUploadEnv;
}
