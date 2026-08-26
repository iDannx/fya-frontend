import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fya.credits',
  appName: 'Fya Créditos',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
