import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mishkat.islamic',
  appName: 'MISHKAT',
  webDir: '.',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
