import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environment/environment';
import type { ImageKitClientConfig } from '../../../environment/environment.types';
import type { ApiResponse } from '../api/api-response';
import {
  IMAGEKIT_UPLOAD_URL,
  type ImageKitAuthCredentials,
  type ImageKitUploadResult,
} from './image-upload.models';

/**
 * Uploads images to a configured host and returns a public URL for the backend.
 * Swap providers via `environment.imageUpload.provider` (and matching config block).
 */
@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  /**
   * Upload a file and return a stable HTTPS URL (e.g. ImageKit CDN URL).
   */
  async uploadPublicImage(file: File): Promise<string> {
    const cfg = environment.imageUpload;
    switch (cfg.provider) {
      case 'none':
        throw new Error('Image uploads are disabled. Set environment.imageUpload.provider.');
      case 'imagekit': {
        if (!cfg.imageKit) {
          throw new Error('imageUpload.imageKit is not configured in environment.');
        }
        return this.uploadViaImageKit(file, cfg.imageKit);
      }
      default:
        throw new Error(`Unknown image upload provider: ${(cfg as { provider: string }).provider}`);
    }
  }

  private async uploadViaImageKit(file: File, imageKit: ImageKitClientConfig): Promise<string> {
    if (!imageKit?.publicKey?.trim()) {
      throw new Error('ImageKit publicKey is missing. Set environment.imageUpload.imageKit.publicKey.');
    }
    if (!imageKit.authenticationPath?.trim()) {
      throw new Error(
        'ImageKit authenticationPath is missing. Set environment.imageUpload.imageKit.authenticationPath (backend endpoint that returns token, signature, expire).',
      );
    }

    const prepared = await this.optimizeForUpload(file, imageKit);
    const auth = await this.fetchImageKitAuth(imageKit.authenticationPath);
    const form = new FormData();
    form.append('file', prepared);
    form.append('fileName', this.safeFileName(prepared.name));
    form.append('publicKey', imageKit.publicKey.trim());
    form.append('signature', auth.signature);
    form.append('token', auth.token);
    form.append('expire', String(auth.expire));
    if (imageKit.folder?.trim()) form.append('folder', imageKit.folder.trim());
    if (imageKit.useUniqueFileName === false) form.append('useUniqueFileName', 'false');

    const res = await fetch(imageKit.uploadUrl?.trim() || IMAGEKIT_UPLOAD_URL, {
      method: 'POST',
      body: form,
    });
    const body = (await res.json()) as ImageKitUploadResult & { message?: string };
    if (!res.ok) {
      throw new Error(body?.message ?? `ImageKit upload failed (${res.status})`);
    }
    if (!body?.url?.trim()) {
      throw new Error('ImageKit response did not include a file URL.');
    }
    return body.url.trim();
  }

  private async fetchImageKitAuth(authenticationPath: string): Promise<ImageKitAuthCredentials> {
    const url = this.resolveUrl(authenticationPath);
    const raw = await firstValueFrom(
      this.http.get<ApiResponse<ImageKitAuthCredentials> | ImageKitAuthCredentials>(url, {
        withCredentials: true,
      }),
    );
    const auth = this.unwrapAuth(raw);
    if (!auth.token || !auth.signature || auth.expire == null) {
      throw new Error('Invalid ImageKit auth response from server.');
    }
    return auth;
  }

  private unwrapAuth(raw: ApiResponse<ImageKitAuthCredentials> | ImageKitAuthCredentials): ImageKitAuthCredentials {
    if (raw && typeof raw === 'object' && 'success' in raw && raw.success === 1 && 'data' in raw) {
      return (raw as ApiResponse<ImageKitAuthCredentials>).data;
    }
    return raw as ImageKitAuthCredentials;
  }

  private resolveUrl(pathOrUrl: string): string {
    const t = pathOrUrl.trim();
    if (t.startsWith('http://') || t.startsWith('https://')) return t;
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    const path = t.startsWith('/') ? t : `/${t}`;
    return `${base}${path}`;
  }

  private safeFileName(name: string): string {
    const base = name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'profile';
    return base.length > 120 ? `${base.slice(0, 120)}` : base;
  }

  /** Downscale large photos before upload to reduce time and storage. */
  private async optimizeForUpload(file: File, imageKit: ImageKitClientConfig): Promise<File> {
    const maxSize = imageKit.maxUploadDimension ?? 2048;
    const quality = imageKit.jpegQuality ?? 0.88;

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close();
        return file;
      }
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob) return file;
      return new File([blob], this.safeFileName(file.name.replace(/\.[^.]+$/, '') + '.jpg'), {
        type: 'image/jpeg',
      });
    } catch {
      return file;
    }
  }
}
