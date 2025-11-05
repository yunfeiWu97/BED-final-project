import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

import serviceAccount from "../firebase-service-account.json";

/**
 * Initialize Firebase Admin using a local service account JSON.
 * We follow A4, not to use .env now
 */
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

// Export Admin SDK handles
const auth: Auth = getAuth();
const db: Firestore = getFirestore();

export { auth, db };
