import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myhaq.app',
  appName: 'MyHaq',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
