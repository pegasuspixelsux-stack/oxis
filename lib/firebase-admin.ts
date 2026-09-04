import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Server-only Firebase Admin access. Never import this from a client component —
// the "server-only" import above makes that a build-time error if attempted.
//
// Lazily initialized so a missing FIREBASE_SERVICE_ACCOUNT_KEY doesn't crash
// `next build` at module-eval time — it only throws when a caller actually
// tries to read/write, with a clear message pointing at the missing env var.

function createAdminApp(): App {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate a service account key in " +
        "Firebase Console → Project Settings → Service Accounts → Generate new private key, " +
        "then set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local to the full JSON (as a single-line string)."
    );
  }

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

let _app: App | null = null;

function getAdminApp(): App {
  if (!_app) {
    _app = getApps().length ? getApps()[0] : createAdminApp();
  }
  return _app;
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminStorage() {
  return getStorage(getAdminApp());
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

// 5 days, in milliseconds — Admin SDK session cookies cap at 14 days.
export const SESSION_COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE_NAME = "session";
