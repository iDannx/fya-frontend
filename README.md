# fya-credits-app

Aplicación Ionic + React para registrar y consultar créditos, empaquetada como APK con Capacitor. Consume la API de `fya-credits-api` y autentica contra Auth0 con Authorization Code + PKCE.

## Deploy

```
https://fya.elion.com.co/
```

## Usuario de prueba

```
innovacion@fya.com
innovaciontest*!
```

## Descargar APK

```
https://github.com/iDannx/fya-frontend/releases/tag/v1.0.0
```

## Stack

- Ionic React 8 / React 18 / TypeScript
- Vite
- Capacitor 6 (Android)
- @auth0/auth0-react
- axios

## Requisitos

- Node 20 o superior
- JDK 17 y Android SDK, solo para construir el APK
- Una imagen de emulador **con Google APIs**. El login abre la pestaña del navegador del sistema y una imagen AOSP pelada no trae Chrome.

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Queda en http://localhost:5173. Necesita el backend corriendo en la URL de `VITE_API_URL`; si no quieres levantarlo en local, apunta esa variable al backend desplegado.

## Variables de entorno

```env
VITE_API_URL=
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_AUTH0_REDIRECT_URI_NATIVE=
```

Hay dos archivos y Vite elige según el comando:

- `.env` lo usa `npm run dev`
- `.env.production` lo usa `npm run build`, así que **es el que acaba dentro del APK**

Los dos están en `.gitignore`. Hay un `.example` de cada uno.

`VITE_AUTH0_REDIRECT_URI_NATIVE` es la URI completa del esquema personalizado, copiada literalmente de la registrada en Auth0. Podría derivarse del `appId`, pero prefiero que lo que hay en el archivo sea exactamente lo que hay en el tenant, sin lógica en medio que pueda desviarse.

`VITE_AUTH0_AUDIENCE` tiene que coincidir carácter a carácter con el `AUTH0_AUDIENCE` del backend. Una barra final de más y el backend rechaza el token con 401 sin explicar por qué.

## Build del APK

```bash
npm run build && npx cap sync android && cd android && ./gradlew assembleRelease
```

Queda en `android/app/build/outputs/apk/release/app-release.apk`. Para depuración, `assembleDebug` y la carpeta `apk/debug/`.

El frontend va horneado dentro del APK: cambiar `src/` no se refleja hasta rehacer el `build` y el `sync`.

### Firma

`assembleRelease` firma solo si existe `android/keystore.properties`. Ese archivo y el `.jks` están ignorados, así que hay que crearlos:

```bash
cd android
keytool -genkeypair -v -keystore fya-release.jks -alias fya \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Fya Social Capital, O=Fya Social Capital, C=CO"
```

```properties
storeFile=fya-release.jks
storePassword=TU_PASSWORD
keyAlias=fya
keyPassword=TU_PASSWORD
```

Sin ese archivo el build no falla: genera un APK sin firmar. Para comprobarlo, `apksigner verify --print-certs`.

### Icono y splash

```bash
npx capacitor-assets generate --android \
  --iconBackgroundColor "#FFFFFF" --splashBackgroundColor "#FFFFFF" \
  --splashBackgroundColorDark "#052224"
```

Las fuentes están en `assets/`, fuera de `src/` para que no entren en el bundle web. `icon-foreground.png` lleva margen a propósito: Android enmascara los iconos adaptativos en círculo y solo garantiza visible el 62% central, así que un glifo a sangre se recorta.

## Configuración en Auth0

La aplicación es de tipo Native y no tiene Client Secret. Si algún paso lo pide, la configuración está mal.

- Allowed Callback URLs: `http://localhost:5173` y `com.fya.credits://TU_DOMINIO/capacitor/com.fya.credits/callback`
- Allowed Logout URLs: los dos mismos
- Allowed Web Origins: `http://localhost:5173` y `https://localhost`
- Allowed Origins (CORS): `https://localhost`
- En la API, activar Allow Offline Access

Los dos últimos son los que cuesta encontrar. **Allowed Origins (CORS) es un campo distinto de Allowed Web Origins** y es el que decide si Auth0 devuelve cabeceras CORS en `/oauth/token`. El WebView de Capacitor sirve la app desde `https://localhost`, así que el canje del código es un `fetch` de navegador y necesita ese permiso. Auth0 permite implícitamente los orígenes de las Callback URLs, pero la nuestra es un esquema personalizado y su origen no es `https://localhost`. Sin eso el login llega hasta el consentimiento, vuelve, y se queda en la pantalla de acceso sin mensaje.

**Allow Offline Access** hace falta porque en Capacitor no funciona la renovación silenciosa por iframe. Sin refresh token la sesión se cae al expirar el access token.

El `appId` debe ser exactamente `com.fya.credits` en `capacitor.config.ts`, en el `intent-filter` del `AndroidManifest.xml` y en la Callback URL de Auth0.


## Estructura

```
src/
├── api/          cliente axios con interceptor de token, llamadas y caché de token
├── components/   AppHeader, FormField, StatusView, Logo
├── hooks/        useAuth, useCredits
├── pages/        Login, CreditForm, CreditList
├── theme/        paleta y sobrescritura de variables de Ionic
├── types/        interfaces compartidas
├── config.ts     único punto de lectura de import.meta.env
└── format.ts     formateo es-CO de moneda, tasa, plazo y fecha

assets/           fuentes de icono y splash, no entran en el bundle
```

## Decisiones técnicas

**Todo `import.meta.env` está en `config.ts`.** Es también donde se decide entre redirección web y esquema nativo con `Capacitor.isNativePlatform()`, para que esa bifurcación exista en un solo sitio.

**El token se guarda en `@capacitor/preferences`** mediante una implementación de `ICache` de Auth0 (`api/tokenCache.ts`), no en `localStorage`. Se autoriza siempre con el access token, nunca con el ID token.

**El interceptor de respuesta traduce los errores a español** antes de que lleguen a la UI, así que los componentes solo leen `error.message`. Distingue tres casos: sin respuesta, 401, y el `ApiError` del backend.

**`useCredits` es dueño del estado de la consulta** —filtros, orden, página y tamaño— en lugar de recibirlo desde la página. Si la página construyera el objeto de consulta, su identidad cambiaría en cada render y el `useEffect` entraría en bucle.

**Los filtros de texto tienen 300 ms de retardo.** El orden y la paginación no, porque ahí el usuario espera respuesta inmediata.

**El orden se cicla en tres estados**: descendente, ascendente y sin orden. Al quitarlo no se manda el parámetro `sort` y aplica el del backend, en lugar de inventar un estado ficticio en el cliente.

**La tabla es una sola tabla.** Por debajo de 768 px las filas se convierten en tarjetas con CSS y las etiquetas salen de `data-label` con `::before`. No hay dos marcados distintos ni desplazamiento horizontal.

**`FormField` centraliza etiqueta, input y error.** Se usa nueve veces entre el formulario y los filtros; sin él sería el mismo bloque repetido.

**La paleta se aplica sobrescribiendo las variables de Ionic** en `theme/variables.css`, no con estilos sueltos por componente. `--ion-color-primary-contrast` está en `#052224`, que es lo que hace que el texto sobre los botones verdes tenga contraste suficiente. El verde nunca se usa como color de texto.

**Se añadió un color fuera de la paleta, `--fya-danger`,** para los errores de validación. Con `#052224` serían tipográficamente indistinguibles de las etiquetas y no se vería qué campo está mal.

## Pruebas

No hay. Es la carencia más clara del repositorio.

La validación del formulario y el ciclo de orden se comprobaron a mano en navegador y emulador, pero no quedó nada automatizado. Con más tiempo el orden sería: Vitest para `validate()` de `CreditForm` y para los formateadores de `format.ts`, que son funciones puras y dan el mejor retorno; después Testing Library para `useCredits`.

Tampoco hay linter configurado. Lo que sí hay es `tsconfig.json` con `strict`, `noUnusedLocals` y `noUnusedParameters`, así que el código muerto rompe el build en lugar de acumularse.

## Limitaciones

- **Sin tests ni linter**, como está dicho arriba.
- **El bundle son 1,3 MB** sin dividir en chunks. Para un APK, donde los assets se sirven locales, no compensaba el trabajo.
- **El límite de 10 peticiones por minuto del backend se alcanza explorando la app**, porque cada clic en un chip de orden lanza una. El mensaje que se muestra es correcto y se recupera una petición cada 6 segundos, pero agrupar los cambios de orden con un retardo lo evitaría.
- **El logo va como PNG**, no como SVG. El SVG que había en los assets de marca no tenía trazos.
- **Solo Android.** El proyecto de iOS no está generado.
