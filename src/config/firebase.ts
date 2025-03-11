import * as firebaseAdmin from "firebase-admin";

// Load the service account key from environment variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

// Initialize Firebase Admin SDK
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export { firebaseAdmin };
