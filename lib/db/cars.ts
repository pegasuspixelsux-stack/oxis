// Shared `cars` collection types and seed data. Zero imports of
// "server-only" or "firebase-admin" (not even type-only) — client
// components (the dashboard and public inventory pages, the vehicle
// form modal) import this module directly for `Car`/`CarSeed`/
// `CARS_COLLECTION`, and bundling any firebase-admin code into a
// client bundle fails to build (it pulls in Node-only internals like
// `tls`/`net`/gRPC). The Admin-SDK-dependent seeding logic that used
// to live here now lives in ./seed-cars.ts instead.

export const CARS_COLLECTION = "cars";

export type CarSeed = {
  title: string;
  price: string;
  mileage: string;
  // Free-form strings, not enums — Firestore doesn't enforce a schema, and
  // the dashboard's add/edit form (components/inventory/vehicle-form-modal.tsx)
  // deliberately lets an agent type any value (e.g. a body style like "Wagon"
  // or a drivetrain label like "Quattro" that a fixed union would exclude).
  drivetrain: string;
  transmission: string;
  bodyStyle: string;
  make: string;
  year: number;
  status: "Published";
  img: string;
  images?: string[];
  description?: string;
  features?: string[];
};

// Curated checklist offered in the dashboard's add/edit modal — an agent
// toggles whichever apply rather than typing free text, so a vehicle's
// features stay consistent and filterable across listings.
export const COMMON_VEHICLE_FEATURES = [
  "Bluetooth",
  "Apple CarPlay / Android Auto",
  "Cámara de reversa",
  "Cámara 360°",
  "Sensores de estacionamiento",
  "Techo solar",
  "Asientos de cuero",
  "Asientos calefaccionados",
  "Navegación GPS",
  "Control de crucero adaptativo",
  "Llantas de aleación",
  "Encendido sin llave",
  "Tercera fila de asientos",
  "Enganche para remolque",
] as const;

// A `cars` document as read back from Firestore, including its id. The
// canonical shape shared by the dashboard (create/edit) and the public
// inventory pages, so they don't each redeclare a slightly different
// local type.
export type Car = CarSeed & { id: string };

// 12 fully detailed listings. Photos are existing Unsplash car photography —
// the first 8 URLs already ship in lib/vehicles.ts; the remaining 4 (Audi,
// Mercedes-Benz, a second BMW, a second Porsche) were pulled from Unsplash
// and visually confirmed to show the matching make/body style before being
// added here.
export const CAR_SEED_DATA: CarSeed[] = [
  {
    title: "2021 Tesla Model 3 Long Range",
    price: "$27,990",
    mileage: "38,900 mi",
    drivetrain: "AWD",
    transmission: "Automatic",
    bodyStyle: "Sedan",
    make: "Tesla",
    year: 2021,
    status: "Published",
    img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89",
  },
  {
    title: "2019 BMW M4 Competition",
    price: "$42,500",
    mileage: "51,200 mi",
    drivetrain: "RWD",
    transmission: "Automatic",
    bodyStyle: "Coupe",
    make: "BMW",
    year: 2019,
    status: "Published",
    img: "https://images.unsplash.com/photo-1605515298946-d062f2e9da53",
  },
  {
    title: "2020 Chevrolet Camaro SS 1LE",
    price: "$38,900",
    mileage: "29,600 mi",
    drivetrain: "RWD",
    transmission: "Manual",
    bodyStyle: "Coupe",
    make: "Chevrolet",
    year: 2020,
    status: "Published",
    img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
  },
  {
    title: "2018 Porsche Panamera 4S",
    price: "$54,900",
    mileage: "44,500 mi",
    drivetrain: "AWD",
    transmission: "Automatic",
    bodyStyle: "Sedan",
    make: "Porsche",
    year: 2018,
    status: "Published",
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  },
  {
    title: "2022 Ford Expedition XLT 4x4",
    price: "$46,200",
    mileage: "25,700 mi",
    drivetrain: "4WD",
    transmission: "Automatic",
    bodyStyle: "SUV",
    make: "Ford",
    year: 2022,
    status: "Published",
    img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
  },
  {
    title: "2017 Volkswagen Golf SE",
    price: "$14,500",
    mileage: "84,200 mi",
    drivetrain: "FWD",
    transmission: "Automatic",
    bodyStyle: "Hatchback",
    make: "Volkswagen",
    year: 2017,
    status: "Published",
    img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
  },
  {
    title: "2023 Hyundai Accent SEL",
    price: "$17,800",
    mileage: "14,800 mi",
    drivetrain: "FWD",
    transmission: "Automatic",
    bodyStyle: "Sedan",
    make: "Hyundai",
    year: 2023,
    status: "Published",
    img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a",
  },
  {
    title: "1974 Volkswagen Beetle Classic",
    price: "$22,000",
    mileage: "110,900 mi",
    drivetrain: "RWD",
    transmission: "Manual",
    bodyStyle: "Hatchback",
    make: "Volkswagen",
    year: 1974,
    status: "Published",
    img: "https://images.unsplash.com/photo-1489824904134-891ab64532f1",
  },
  {
    title: "2022 Audi RS7 Sportback",
    price: "$89,995",
    mileage: "18,300 mi",
    drivetrain: "Quattro",
    transmission: "Automatic",
    bodyStyle: "Sedan",
    make: "Audi",
    year: 2022,
    status: "Published",
    img: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b",
  },
  {
    title: "2021 Mercedes-AMG GT",
    price: "$118,500",
    mileage: "9,600 mi",
    drivetrain: "RWD",
    transmission: "Automatic",
    bodyStyle: "Coupe",
    make: "Mercedes-Benz",
    year: 2021,
    status: "Published",
    img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
  },
  {
    title: "2021 BMW 330i xDrive",
    price: "$28,995",
    mileage: "32,400 mi",
    drivetrain: "AWD",
    transmission: "Automatic",
    bodyStyle: "Sedan",
    make: "BMW",
    year: 2021,
    status: "Published",
    img: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785",
  },
  {
    title: "2023 Porsche 911 Turbo S",
    price: "$189,900",
    mileage: "4,200 mi",
    drivetrain: "AWD",
    transmission: "Automatic",
    bodyStyle: "Coupe",
    make: "Porsche",
    year: 2023,
    status: "Published",
    img: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73",
  },
];
