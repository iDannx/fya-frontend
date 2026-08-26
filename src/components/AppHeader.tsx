import { IonButton, IonHeader, IonToolbar } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';
import './AppHeader.css';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { signOut } = useAuth();

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <div className="app-header__bar">
          <Logo height={26} />
          <h1 className="app-header__title">{title}</h1>
          <IonButton className="app-header__signout" fill="clear" size="small" onClick={signOut}>
            Salir
          </IonButton>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
