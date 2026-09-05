"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

// Single-car read for the public vehicle-detail surface. Extracted from
// app/inventory/[id]/page.tsx so every theme's detail layout shares it.
export function useCarDetail(id: string | undefined) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getDoc(doc(db, CARS_COLLECTION, id))
      .then((snap) => {
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          setCar({ id: snap.id, ...snap.data() } as Car);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("[use-car-detail] failed to load car", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { car, loading, notFound };
}
