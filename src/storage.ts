import { Verification } from './types';

const STORAGE_KEY = 'wallet-verifications';

export const saveVerification = (verification: Verification) => {
  const verifications = getVerifications();
  verifications.push(verification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(verifications));
};

export const getVerifications = (): Verification[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};