/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_FIRESTORE_DATABASE_ID?: string;
  readonly VITE_FIREBASE_OAUTH_CLIENT_ID?: string;
  readonly VITE_DEFAULT_DEMO_EMAIL?: string;
  readonly VITE_DEFAULT_DEMO_NAME?: string;
  readonly VITE_DEFAULT_USER_EMAIL?: string;
  readonly VITE_ADMIN_SUPPORT_EMAIL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
