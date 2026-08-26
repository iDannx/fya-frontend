import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import {
  IonApp,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { addCircleOutline, listOutline } from 'ionicons/icons';
import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { setAccessTokenProvider } from './api/client';
import { isNative } from './config';
import { useAuth } from './hooks/useAuth';
import CreditForm from './pages/CreditForm';
import CreditList from './pages/CreditList';
import Login from './pages/Login';
import './App.css';

export default function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, handleRedirectCallback } = useAuth();

  useEffect(() => {
    setAccessTokenProvider(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!isNative) {
      return;
    }
    const listener = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('state=') && (url.includes('code=') || url.includes('error='))) {
        await handleRedirectCallback(url);
      }
      await Browser.close();
    });
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [handleRedirectCallback]);

  if (isLoading) {
    return (
      <IonApp>
        <IonPage>
          <IonContent fullscreen>
            <div className="app-splash">
              <IonSpinner name="crescent" />
            </div>
          </IonContent>
        </IonPage>
      </IonApp>
    );
  }

  if (!isAuthenticated) {
    return (
      <IonApp>
        <Login />
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/creditos" component={CreditList} />
            <Route exact path="/creditos/nuevo" component={CreditForm} />
            <Route exact path="/" render={() => <Redirect to="/creditos" />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="consulta" href="/creditos">
              <IonIcon icon={listOutline} />
              <IonLabel>Consultar</IonLabel>
            </IonTabButton>
            <IonTabButton tab="registro" href="/creditos/nuevo">
              <IonIcon icon={addCircleOutline} />
              <IonLabel>Registrar</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
