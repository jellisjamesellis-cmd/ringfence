import type { IconName } from '@/components/Icon';

export type LockableApp = {
  id: string;
  name: string;
  detail: string;
  icon: IconName;
  color: string;
  defaultOn: boolean;
};

export type FreezableAccount = {
  id: string;
  name: string;
  provider: string;
  detail: string;
  icon: IconName;
  color: string;
  defaultOn: boolean;
};

/** Apps that lock on the phone itself. Names are labels only: nothing is connected yet. */
export const LOCKABLE_APPS: LockableApp[] = [
  { id: 'photos', name: 'Photos', detail: 'Photos and videos', icon: 'photos', color: '#B5523B', defaultOn: true },
  { id: 'mail', name: 'Mail', detail: 'Password reset emails', icon: 'mail', color: '#3A6EA5', defaultOn: true },
  { id: 'messages', name: 'Messages', detail: 'Texts and one-time codes', icon: 'messages', color: '#3E8E5E', defaultOn: true },
  { id: 'whatsapp', name: 'WhatsApp', detail: 'Chats and media', icon: 'chat', color: '#2E7D4F', defaultOn: true },
  { id: 'passwords', name: 'Passwords', detail: 'Saved logins', icon: 'key', color: '#4A4F57', defaultOn: true },
  { id: 'authenticator', name: 'Authenticator', detail: 'Two-factor codes', icon: 'authenticator', color: '#24548F', defaultOn: true },
  { id: 'notes', name: 'Notes', detail: 'Personal notes', icon: 'notes', color: '#C08A2B', defaultOn: false },
  { id: 'files', name: 'Files', detail: 'Documents and ID scans', icon: 'files', color: '#5A6B85', defaultOn: false },
];

/** Accounts that freeze with the provider. Generic until real bank integrations exist. */
export const FREEZABLE_ACCOUNTS: FreezableAccount[] = [
  { id: 'current', name: 'Current account', provider: 'Main bank', detail: '•• 4821', icon: 'bank', color: '#2B4C7E', defaultOn: true },
  { id: 'savings', name: 'Savings', provider: 'Main bank', detail: '•• 0937', icon: 'savings', color: '#2F6B5A', defaultOn: true },
  { id: 'credit', name: 'Credit card', provider: 'Card issuer', detail: '•• 1266', icon: 'card', color: '#5B3F8C', defaultOn: true },
  { id: 'wallet', name: 'Payments wallet', provider: 'Online payments', detail: 'Linked to your email', icon: 'pay', color: '#1F6F8B', defaultOn: true },
  { id: 'creditfile', name: 'Credit file', provider: 'Credit reference agencies', detail: 'Blocks new loans and cards in your name', icon: 'credit', color: '#7A3E3E', defaultOn: true },
];

/** Extra accounts the user can add from the Protection tab. */
export const ADDABLE_ACCOUNTS: FreezableAccount[] = [
  { id: 'crypto', name: 'Crypto exchange', provider: 'Exchange', detail: 'Withdrawals and trading', icon: 'crypto', color: '#8A6A1F', defaultOn: false },
  { id: 'isa', name: 'Investment ISA', provider: 'Investment platform', detail: 'Withdrawals and transfers', icon: 'savings', color: '#3D5A80', defaultOn: false },
  { id: 'business', name: 'Business account', provider: 'Business bank', detail: '•• 5530', icon: 'bank', color: '#4B5D6E', defaultOn: false },
  { id: 'secondbank', name: 'Second bank', provider: 'Digital bank', detail: '•• 7714', icon: 'card', color: '#8C3F6A', defaultOn: false },
];

const all = [...FREEZABLE_ACCOUNTS, ...ADDABLE_ACCOUNTS];
export const appById = (id: string) => LOCKABLE_APPS.find(a => a.id === id);
export const accountById = (id: string) => all.find(a => a.id === id);
