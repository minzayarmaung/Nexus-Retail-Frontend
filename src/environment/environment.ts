import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  /**
   * Image uploads: switch `provider` to change implementation.
   * ImageKit requires a backend endpoint that returns upload auth (token, signature, expire).
   */
  imageUpload: {
    provider: 'imagekit',
    imageKit: {
      publicKey: 'public_BKi4SumoY6hXjFkg3ddKztt3X24=',
      urlEndpoint: 'https://ik.imagekit.io/nexusretail',
      authenticationPath: '/nexusretail/api/v1/media/imagekit/auth',
      folder: 'employees/profile',
    },
  },
};
