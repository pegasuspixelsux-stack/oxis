export type BodyStyle = "Sedan" | "Coupe" | "SUV" | "Hatchback";

export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: BodyStyle;
  price: number;
  mileage: number;
  fuelType: "Gasoline" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD";
  exteriorColor: string;
  badge?: string;
  image: string;
  imageAlt: string;
};

export const vehicles: Vehicle[] = [
  {
    id: "tesla-model3-2021",
    year: 2021,
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    bodyStyle: "Sedan",
    price: 28900,
    mileage: 38900,
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "AWD",
    exteriorColor: "Blanco Perla",
    badge: "Certificado",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89",
    imageAlt: "Tesla Model 3 blanco estacionado en un mirador de montaña",
  },
  {
    id: "bmw-m4-2019",
    year: 2019,
    make: "BMW",
    model: "M4",
    trim: "Competition",
    bodyStyle: "Coupe",
    price: 42500,
    mileage: 51200,
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "RWD",
    exteriorColor: "Blanco Alpino",
    badge: "Certificado",
    image: "https://images.unsplash.com/photo-1605515298946-d062f2e9da53",
    imageAlt: "BMW M4 blanco cupé estacionado en un playón",
  },
  {
    id: "chevrolet-camaro-2020",
    year: 2020,
    make: "Chevrolet",
    model: "Camaro",
    trim: "SS 1LE",
    bodyStyle: "Coupe",
    price: 38900,
    mileage: 29600,
    fuelType: "Gasoline",
    transmission: "Manual",
    drivetrain: "RWD",
    exteriorColor: "Azul Riverside",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
    imageAlt: "Chevrolet Camaro SS azul estacionado en el desierto",
  },
  {
    id: "porsche-panamera-2018",
    year: 2018,
    make: "Porsche",
    model: "Panamera",
    trim: "4S",
    bodyStyle: "Sedan",
    price: 54900,
    mileage: 44500,
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    exteriorColor: "Negro Metalizado",
    badge: "Bajo Kilometraje",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    imageAlt: "Porsche Panamera negro circulando por una ruta al atardecer",
  },
  {
    id: "ford-expedition-2022",
    year: 2022,
    make: "Ford",
    model: "Expedition",
    trim: "XLT 4x4",
    bodyStyle: "SUV",
    price: 46200,
    mileage: 25700,
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    exteriorColor: "Blanco Oxford",
    badge: "Recién Llegado",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
    imageAlt: "Ford Expedition blanca en un camino desértico",
  },
  {
    id: "volkswagen-golf-2017",
    year: 2017,
    make: "Volkswagen",
    model: "Golf",
    trim: "SE",
    bodyStyle: "Hatchback",
    price: 14500,
    mileage: 84200,
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "FWD",
    exteriorColor: "Azul Reef",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
    imageAlt: "Volkswagen Golf azul estacionado en una calle",
  },
  {
    id: "hyundai-accent-2023",
    year: 2023,
    make: "Hyundai",
    model: "Accent",
    trim: "SEL",
    bodyStyle: "Sedan",
    price: 17800,
    mileage: 14800,
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "FWD",
    exteriorColor: "Negro Fantasma",
    badge: "Recién Llegado",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a",
    imageAlt: "Hyundai Accent negro circulando por un camino arbolado",
  },
  {
    id: "volkswagen-beetle-1974",
    year: 1974,
    make: "Volkswagen",
    model: "Beetle",
    trim: "Clásico",
    bodyStyle: "Hatchback",
    price: 22000,
    mileage: 110900,
    fuelType: "Gasoline",
    transmission: "Manual",
    drivetrain: "RWD",
    exteriorColor: "Naranja Atardecer",
    badge: "Coleccionista",
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1",
    imageAlt: "Volkswagen Escarabajo clásico naranja estacionado en una calle de la ciudad",
  },
];

export const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();
export const bodyStyles: BodyStyle[] = ["Sedan", "Coupe", "SUV", "Hatchback"];
export const bodyStyleLabels: Record<BodyStyle, string> = {
  Sedan: "Sedán",
  Coupe: "Cupé",
  SUV: "SUV",
  Hatchback: "Hatchback",
};

export const fuelTypeLabels: Record<Vehicle["fuelType"], string> = {
  Gasoline: "Nafta",
  Electric: "Eléctrico",
  Hybrid: "Híbrido",
};

export const transmissionLabels: Record<Vehicle["transmission"], string> = {
  Automatic: "Automática",
  Manual: "Manual",
};

export const priceCeilings = [20000, 30000, 50000, 75000];

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(value: number): string {
  return `${new Intl.NumberFormat("es-UY").format(value)} km`;
}
