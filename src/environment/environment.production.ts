import type { AppEnvironment } from './environment.types';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com',
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
