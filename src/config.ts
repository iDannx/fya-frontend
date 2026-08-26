import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

export const apiUrl = import.meta.env.VITE_API_URL;

export const auth0 = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  redirectUri: isNative
    ? import.meta.env.VITE_AUTH0_REDIRECT_URI_NATIVE
    : window.location.origin,
};
