import { creditPackages } from "@/data/credit-packages";
import { transactions } from "@/data/transactions";

export const creditsService = {
  getPackages() {
    return creditPackages;
  },
  getTransactions() {
    return transactions;
  },
};
