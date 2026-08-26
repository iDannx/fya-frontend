import { Auth0Provider } from '@auth0/auth0-react';
import { setupIonicReact } from '@ionic/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { tokenCache } from './api/tokenCache';
import App from './App';
import { auth0 } from './config';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/fonts.css';
import './theme/variables.css';

setupIonicReact({ mode: 'md' });

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0.domain}
      clientId={auth0.clientId}
      cache={tokenCache}
      useRefreshTokens
      authorizationParams={{
        audience: auth0.audience,
        redirect_uri: auth0.redirectUri,
        scope: 'openid profile email offline_access',
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
