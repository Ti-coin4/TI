
export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  telegram: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PublicMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  isAdmin?: boolean;
}

export enum AirdropStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CHECKING_BALANCE = 'CHECKING_BALANCE',
  TASK_PENDING = 'TASK_PENDING',
  VERIFYING_TASK = 'VERIFYING_TASK',
  SUBMITTING = 'SUBMITTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface AirdropEntry {
  id: string;
  address: string;
  timestamp: number;
  status: 'Pending' | 'Distributed';
  currentBalance?: number; // Real-time balance from chain
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balanceTi: number;
  balanceUSDT: number;
  balanceBNB: number;
}

export interface SiteConfig {
  heroTitlePrefix: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  tokenPrice: number;
  airdropAmount: number; // Amount to send per user
  telegram: string;
  twitter: string;
  adminUser?: string;
  adminPass?: string;
}

export interface Token {
  symbol: string;
  address: string; // 'BNB' for native coin
  decimals: number;
  logo: string;
}

export type Language = 'zh' | 'en';
