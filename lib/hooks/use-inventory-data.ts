"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CARS_COLLECTION, type Car } from "@/lib/db/cars";

export type InventoryFilter = {
  search?: string;
  make?: string;
  bodyStyle?: string;
  maxPrice?: number;
};

function numericPrice(price: unknown): number {
  return parseInt(String(price).replace(/[^0-9]/g, ""), 10);
}

// Single source of truth for the public inventory read + its derived
// filter options. Both the home grid and the /inventory listing consume
// this so the two never drift (they used to duplicate the query and the
// price-ceiling math). Themes call filterCars() and slice/paginate the
// result themselves — pagination and "featured N" are presentation.
export function useInventoryData() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(db, CARS_COLLECTION), orderBy("createdAt", "desc")))
      .then((snap) => {
        if (!cancelled) setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Car));
      })
      .catch((err) => console.error("[use-inventory-data] failed to load cars", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const availableMakes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make).filter(Boolean))).sort(),
    [cars]
  );

  const availableBodyStyles = useMemo(
    () => Array.from(new Set(cars.map((c) => c.bodyStyle).filter(Boolean))).sort(),
    [cars]
  );

  const priceCeiling = useMemo(() => {
    const prices = cars.map((c) => numericPrice(c.price)).filter((p) => Number.isFinite(p) && p > 0);
    return prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 100000;
  }, [cars]);

  const filterCars = useCallback(
    (f: InventoryFilter) => {
      const search = (f.search ?? "").trim().toLowerCase();
      return cars.filter((car) => {
        if (search) {
          const hit =
            car.title?.toLowerCase().includes(search) || car.make?.toLowerCase().includes(search);
          if (!hit) return false;
        }
        if (f.make && car.make !== f.make) return false;
        if (f.bodyStyle && car.bodyStyle !== f.bodyStyle) return false;
        if (typeof f.maxPrice === "number") {
          const p = numericPrice(car.price);
          if (Number.isFinite(p) && p > f.maxPrice) return false;
        }
        return true;
      });
    },
    [cars]
  );

  return { cars, loading, availableMakes, availableBodyStyles, priceCeiling, filterCars };
}
