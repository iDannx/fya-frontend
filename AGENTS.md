# AGENTS.md

## Project context

Frontend de la aplicación de créditos: dos pantallas de trabajo —registrar y consultar— más la de acceso. Se distribuye como APK de Android, y la misma base sirve como web.

No tiene estado propio más allá del de la consulta. Todo lo que persiste vive en el backend (`fya-credits-api`) y la sesión la gestiona Auth0.

## Architecture

Vite + React 18 + Ionic React 8, empaquetado con Capacitor 6.

`main.tsx` monta el `Auth0Provider` y llama a `setupIonicReact({ mode: 'md' })`. `App.tsx` es la puerta: mientras `isLoading` muestra un spinner, sin sesión muestra `Login`, y con sesión monta `IonReactRouter` con dos pestañas.

El flujo de autenticación nativo no es el de la web y está repartido en tres sitios:

- `config.ts` decide el `redirectUri` según `Capacitor.isNativePlatform()`
- `hooks/useAuth.ts` abre la URL de Auth0 con `@capacitor/browser` en nativo o `window.location.assign` en web
- `App.tsx` escucha `appUrlOpen` de `@capacitor/app` para completar el intercambio de código y cerrar la pestaña

La comunicación con la API pasa toda por `api/client.ts`: un interceptor de petición inyecta el access token y uno de respuesta traduce los errores a mensajes en español.

`react-router-dom` está en la versión 5 porque es lo que exige el `peerDependency` de `@ionic/react-router@8`. No es una elección.

## Important paths

```
src/config.ts            único punto de lectura de import.meta.env
src/api/client.ts        axios, interceptores de token y de error
src/api/tokenCache.ts    ICache de Auth0 sobre @capacitor/preferences
src/hooks/useCredits.ts  estado de la consulta: filtros, orden, página, tamaño
src/hooks/useAuth.ts     login y logout, rama nativa/web
src/theme/variables.css  paleta y sobrescritura de variables de Ionic
capacitor.config.ts      appId, appName, webDir
android/                 proyecto nativo
assets/                  fuentes de icono y splash
```

## Development commands

```bash
npm run dev       # vite, puerto 5173
npm run build     # tsc --noEmit && vite build
npm run preview

npx cap sync android
cd android && ./gradlew assembleDebug     # o assembleRelease
```

No hay script de test ni de lint: no están configurados.

## Code conventions

TypeScript en `strict`, con `noUnusedLocals` y `noUnusedParameters`. El código muerto rompe el build.

Identificadores en inglés, textos visibles al usuario en español.

Cada componente y cada página llevan su `.css` al lado, con nombres tipo BEM: `.credit-list__sort-chip`, `.form-field__error`.

Los componentes de `components/` no llevan lógica de negocio. `AppHeader` usa `useAuth` para el botón de salir, que es sesión y no negocio.

Los hooks son dueños de su estado y exponen setters; las páginas solo pintan.

El formateo de moneda, tasa, plazo y fecha vive en `format.ts` con `Intl` y locale `es-CO`. No formatear en los componentes.

El código no lleva comentarios.

## Rules for changes

**No cambiar el `appId`.** Es `com.fya.credits` y tiene que coincidir en `capacitor.config.ts`, en el `intent-filter` del `AndroidManifest.xml` y en la Callback URL registrada en Auth0. Cambiarlo rompe el retorno del login en el APK.

**No leer `import.meta.env` fuera de `config.ts`.**

**No hardcodear la URL de la API.** Sale de `VITE_API_URL`, y el APK no puede apuntar a `localhost`.

**No usar `#00D280` como color de texto.** Sobre blanco da un contraste de ~2:1. Va como fondo, con `#052224` encima.

**No maquillar con estilos sueltos por componente** lo que se puede resolver sobrescribiendo la variable de Ionic en `theme/variables.css`.

**No guardar el token en `localStorage`.** Va en `@capacitor/preferences` a través de `api/tokenCache.ts`.

**No autorizar con el ID token.** Se usa el access token.

**No introducir un Client Secret.** El flujo es Authorization Code + PKCE.

**Reutilizar `FormField` y `StatusView`** antes de escribir un input o un estado vacío nuevo.

**No añadir dependencias** si lo que se necesita se resuelve con lo que ya hay.

## Before finishing a change

```
- npm run build  (incluye tsc --noEmit; si el build pasa, no hay código muerto ni errores de tipos)
- Si el cambio afecta al APK: npx cap sync android y reconstruir
- Comprobar el layout por debajo de 768 px, donde la tabla se vuelve tarjetas
- Revisar que no haya entrado ningún valor real en los .example
```

Si el cambio toca `theme/variables.css`, comprobar además que el verde sigue sin usarse como color de texto.

## Known constraints

**El origen del WebView en Android es `https://localhost`**, no `http://localhost` ni `capacitor://localhost`. Tiene que estar en el CORS del backend y en *Allowed Origins (CORS)* de Auth0 —campo distinto de *Allowed Web Origins*, y es el que gobierna el endpoint de token. Sin eso el login vuelve del consentimiento y se queda en la pantalla de acceso sin mensaje.

**Android 12+ ignora `android:background` del tema de arranque.** El splash se controla con `windowSplashScreenBackground` y `windowSplashScreenAnimatedIcon` en `values/styles.xml`, que están puestos a mano; `capacitor-assets` no los escribe.

**Los iconos adaptativos se enmascaran en círculo.** El glifo no puede pasar del 62% del lienzo o se recorta. Por eso `assets/icon-foreground.png` tiene margen.

**El tráfico en claro solo está permitido para `10.0.2.2` y `localhost`** en `network_security_config.xml`. Es para desarrollo contra un backend local desde el emulador; cualquier otra URL exige HTTPS, que es lo que se quiere.

**El HMR de Vite sirve módulos obsoletos de vez en cuando**, mostrando código anterior al del disco. Se arregla borrando `node_modules/.vite` y reiniciando. No afecta al build de producción, pero puede hacer perder un buen rato depurando algo que ya estaba arreglado.

**`react-router-dom` está clavado en la 5.** Subirlo rompe `@ionic/react-router`.

**El backend limita a 10 peticiones por minuto por IP.** Cada clic en un chip de orden lanza una, así que explorando se alcanza. Si se añaden más interacciones que disparen peticiones, conviene agruparlas.

**Las versiones están fijadas sin rango** (`"react": "18.3.1"`, no `^18.3.1`). El stack está cerrado en React 18, Capacitor 6, Vite 5 y TypeScript 5; `latest` ya va por React 19, Capacitor 8, Vite 8 y TypeScript 7.
