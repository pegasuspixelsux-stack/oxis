// Firestore seed logic for the `cars` collection. Deliberately has NO
// import of "server-only" or "@/lib/firebase-admin" — it takes a
// `Firestore` instance as a parameter instead of constructing one itself.
// That keeps this module callable from two places:
//   1. app/api/admin/seed-cars/route.ts (inside the Next.js server, using adminDb())
//   2. scripts/seed-cars.ts (a plain `node` CLI script, which can't import
//      "server-only"-guarded modules since it isn't running inside Next's
//      server bundler where that condition is satisfied)
//
// This is split out from ./cars.ts (types + seed data) specifically so
// client components can import the types/data without pulling
// firebase-admin — a purely Node-side package — into the browser bundle.

import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { CARS_COLLECTION, CAR_SEED_DATA } from "./cars";

export type SeedResult =
  | { seeded: true; count: number }
  | { seeded: false; count: number; reason: "already-populated" };

/**
 * Idempotent seed: only writes the 12 CAR_SEED_DATA documents if the `cars`
 * collection is currently empty. Safe to run on every deploy/boot — re-runs
 * are a no-op once the collection has at least one document.
 */
export async function seedCars(db: Firestore): Promise<SeedResult> {
  const collectionRef = db.collection(CARS_COLLECTION);

  const existing = await collectionRef.limit(1).get();
  if (!existing.empty) {
    return { seeded: false, count: 0, reason: "already-populated" };
  }

  const batch = db.batch();
  for (const car of CAR_SEED_DATA) {
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      ...car,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();

  return { seeded: true, count: CAR_SEED_DATA.length };
}
