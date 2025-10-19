import { writeFileSync, existsSync, mkdirSync } from 'fs';
import * as dotenv from 'dotenv';

const env = process.env['ENVIRONMENT'] || 'dev';
const envFile = `.env.${env}`;

// ✅ Si el archivo existe (modo local), cargarlo
if (existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`📦 Variables cargadas desde ${envFile}`);
} else {
  console.log(`⚠️ Archivo ${envFile} no encontrado, usando variables de entorno (como en Vercel).`);
}

// 🔹 Asegurar que la carpeta exista
const envDir = './src/environments';
if (!existsSync(envDir)) {
  mkdirSync(envDir, { recursive: true });
}

const targetPath = './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: ${process.env['ENVIRONMENT'] === 'prod'},
  firebase: {
    projectId: '${process.env['FIREBASE_PROJECT_ID']}',
    appId: '${process.env['FIREBASE_APP_ID']}',
    storageBucket: '${process.env['FIREBASE_STORAGE_BUCKET']}',
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    authDomain: '${process.env['FIREBASE_AUTH_DOMAIN']}',
    messagingSenderId: '${process.env['FIREBASE_MESSAGING_SENDER_ID']}',
    measurementId: '${process.env['FIREBASE_MEASUREMENT_ID']}',
  },
  reCaptchaV3SiteKey: '${process.env['RECAPTCHA_KEY']}',
  environment: '${process.env['ENVIRONMENT']}'
};
`;

writeFileSync(targetPath, envConfigFile);
console.log(`✅ environment.ts generado para entorno: ${env}`);
