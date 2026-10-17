export type Member = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  creditBalance: number;
  joinedAt: string;
};

export type CreditTransaction = {
  id: string;
  title: string;
  detail: string;
  amount: number;
  date: string;
  type: "purchase" | "usage" | "bonus";
};

export type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  label?: string;
};
