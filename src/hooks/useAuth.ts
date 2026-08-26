import { useAuth0 } from '@auth0/auth0-react';
import { Browser } from '@capacitor/browser';
import { useCallback } from 'react';
import { auth0, isNative } from '../config';

async function openAuthorizationUrl(url: string): Promise<void> {
  if (isNative) {
    await Browser.open({ url, windowName: '_self' });
    return;
  }
  window.location.assign(url);
}

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    error,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    handleRedirectCallback,
  } = useAuth0();

  const signIn = useCallback(
    () => loginWithRedirect({ openUrl: openAuthorizationUrl }),
    [loginWithRedirect],
  );

  const signOut = useCallback(
    () =>
      logout({
        logoutParams: { returnTo: auth0.redirectUri },
        openUrl: openAuthorizationUrl,
      }),
    [logout],
  );

  return {
    isAuthenticated,
    isLoading,
    error,
    user,
    signIn,
    signOut,
    getAccessTokenSilently,
    handleRedirectCallback,
  };
}
