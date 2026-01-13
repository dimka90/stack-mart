/**
 * Validation utilities for StackMart marketplace
 */

export const validateStacksAddress = (address: string): boolean => {
  if (!address) return false;
  // Stacks addresses start with SP or ST and are 39-41 characters
  const stacksAddressRegex = /^[SP][0-9A-Z]{38,40}$/;
  return stacksAddressRegex.test(address);
};

export const validatePrice = (price: string): { valid: boolean; error?: string } => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }
  if (numPrice > 1000000) {
    return { valid: false, error: 'Price cannot exceed 1,000,000 STX' };
  }
  return { valid: true };
};

export const validateBasisPoints = (bips: string, max: number = 10000): { valid: boolean; error?: string } => {
  const numBips = parseInt(bips);
  if (isNaN(numBips) || numBips < 0) {
    return { valid: false, error: 'Must be a non-negative integer' };
  }
  if (numBips > max) {
    return { valid: false, error: `Cannot exceed ${max} basis points (${max / 100}%)` };
  }
  return { valid: true };
};

export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatSTX = (microSTX: number | string): string => {
  const num = typeof microSTX === 'string' ? parseFloat(microSTX) : microSTX;
  if (isNaN(num)) return '0';
  return (num / 1000000).toFixed(6).replace(/\.?0+$/, '');
};

/**
 * Extract Stacks address from userData - supports both old and new API formats
 * @param userData - User data object from @stacks/connect
 * @returns Stacks address string or null
 */
export const getStacksAddress = (userData: any): string | null => {
  if (!userData) return null;
  
  // Try new API format first (addresses.stx[0].address)
  if (userData.addresses?.stx?.[0]?.address) {
    return userData.addresses.stx[0].address;
  }
  
  // Try alternative new API format (addresses.stx as string array)
  if (Array.isArray(userData.addresses?.stx) && userData.addresses.stx.length > 0) {
    const firstAddress = userData.addresses.stx[0];
    if (typeof firstAddress === 'string') {
      return firstAddress;
    }
    if (firstAddress?.address) {
      return firstAddress.address;
    }
  }
  
  // Try old API format (profile.stxAddress)
  if (userData.profile?.stxAddress?.mainnet) {
    return userData.profile.stxAddress.mainnet;
  }
  
  if (userData.profile?.stxAddress?.testnet) {
    return userData.profile.stxAddress.testnet;
  }
  
  return null;
};

