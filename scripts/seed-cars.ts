// Standalone CLI seeding script — run with:
//   node --env-file=.env.local scripts/seed-cars.ts
// (or `npm run seed:cars`, which wires up --env-file for you)
//
// This does NOT import "@/lib/firebase-admin" because that module starts
// with `import "server-only"`, which throws unconditionally outside of
// Next's server bundler. Instead it initializes the Admin SDK itself from
// the same FIREBASE_SERVICE_ACCOUNT_KEY env var, then delegates the actual
// seed logic to the shared, portable lib/db/cars.ts module.

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedCars, CAR_SEED_DATA } from "../lib/db/cars.ts";

function loadServiceAccount(): Record<string, unknown> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set.\n" +
        "Run this with: node --env-file=.env.local scripts/seed-cars.ts"
    );
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
    process.exit(1);
  }
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const app = initializeApp({ credential: cert(serviceAccount) }, "seed-cars-script");
  const db = getFirestore(app);

  console.log(`Seeding "cars" collection (${CAR_SEED_DATA.length} listings if empty)...`);
  const result = await seedCars(db);

  if (result.seeded) {
    console.log(`✔ Wrote ${result.count} vehicle listings to "cars".`);
  } else {
    console.log('↷ "cars" collection already has documents — skipped seeding (no duplicates).');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
