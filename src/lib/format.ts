/* Formatadores localizados para Angola (pt-AO, AOA, IVA 14%). */

const aoa = new Intl.NumberFormat("pt-AO", {
  style: "currency",
  currency: "AOA",
  minimumFractionDigits: 2,
});

const dec = new Intl.NumberFormat("pt-AO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const int = new Intl.NumberFormat("pt-AO");

const dateLong = new Intl.DateTimeFormat("pt-AO", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateShort = new Intl.DateTimeFormat("pt-AO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const fmt = {
  aoa: (v: number) => aoa.format(v),
  dec: (v: number) => dec.format(v),
  int: (v: number) => int.format(v),
  date: (v: string | Date) => dateShort.format(new Date(v)),
  dateLong: (v: string | Date) => dateLong.format(new Date(v)),
  nif: (v: string) => v.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3"),
  pct: (v: number) => `${dec.format(v)}%`,
};

export const IVA_RATES = [0, 5, 7, 14] as const;
export const PROVINCIAS = [
  "Luanda",
  "Benguela",
  "Huíla",
  "Huambo",
  "Cabinda",
  "Bié",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire",
  "Bengo",
  "Cuando Cubango",
] as const;
