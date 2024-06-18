import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deepfoundation.deep',
  appName: 'Deep',
  webDir: 'app',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    useLegacyBridge: true,
  },
};

export default config;
