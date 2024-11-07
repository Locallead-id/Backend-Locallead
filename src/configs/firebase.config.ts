import admin from "firebase-admin";

import * as serviceAccount from "../../firebase_service_account.json";

const FIREBASE_BUCKET = process.env.FIREBASE_BUCKET as string;

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: FIREBASE_BUCKET,
});

export const firebaseStorage = admin.storage();
