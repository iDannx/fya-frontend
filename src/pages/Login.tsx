import { IonButton, IonContent, IonPage } from '@ionic/react';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

export default function Login() {
  const { signIn, error } = useAuth();

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-screen">
          <div className="login-screen__brand">
            <Logo height={56} />
          </div>
          <h1 className="login-screen__title">Créditos</h1>
          <p className="login-screen__subtitle">
            Registra y consulta los créditos de tus clientes desde un solo lugar.
          </p>
          <IonButton className="login-screen__action" expand="block" onClick={signIn}>
            Iniciar sesión
          </IonButton>
          {error && <p className="login-screen__error">{error.message}</p>}
        </div>
      </IonContent>
    </IonPage>
  );
}
