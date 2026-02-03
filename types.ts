
export enum AppRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}

export interface PointEntry {
  id: string;
  amount: number;
  type: 'purchase' | 'referral' | 'redemption';
  date: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
  description: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  pointsEarned: number;
  items: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Nuevo campo para autenticación
  phone?: string;
  referralCode: string;
  totalPoints: number;
  history: Transaction[];
  pointsDetail: PointEntry[];
  referrals: string[]; // List of referred user IDs
}

export interface AppConfig {
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  systemGuide: string;
  redeemConditions: string;
  currency: string;
  language: string;
  pointExpiryDays: number;
  pointsPerArs: number;
}

export interface ReferralStats {
  code: string;
  ownerId: string;
  ownerName: string;
  referralCount: number;
  totalPointsGenerated: number;
  active: boolean;
}
