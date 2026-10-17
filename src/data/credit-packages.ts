import type { CreditPackage } from "@/types/user";

export const creditPackages: CreditPackage[] = [
  { id: "pkg-50", credits: 50, price: 2500 },
  { id: "pkg-100", credits: 100, price: 4500, label: "Popular" },
  { id: "pkg-250", credits: 250, price: 10000, label: "Best value" },
  { id: "pkg-500", credits: 500, price: 18000 },
];
