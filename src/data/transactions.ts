import type { CreditTransaction } from "@/types/user";

export const transactions: CreditTransaction[] = [
  { id: "txn-001", title: "Purchased 100 credits", detail: "Wallet top-up", amount: 100, date: "Sep 24", type: "purchase" },
  { id: "txn-002", title: "Ave Verum Corpus", detail: "Tenor 1 practice", amount: -2, date: "Sep 24", type: "usage" },
  { id: "txn-003", title: "Kyrie Eleison", detail: "Bass practice", amount: -2, date: "Sep 22", type: "usage" },
  { id: "txn-004", title: "Choir welcome bonus", detail: "Admin credit grant", amount: 20, date: "Sep 20", type: "bonus" },
];
