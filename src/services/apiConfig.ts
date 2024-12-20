// Clés de chiffrement pour obfusquer les URLs (à changer en production)
const CIPHER_KEY = 'YOUR_CIPHER_KEY';
const IV = 'YOUR_IV';

// URLs encodées (les vraies URLs sont masquées)
export const ENDPOINTS = {
  BINANCE: btoa('https://api.binance.com/api/v3'),
  KRAKEN: btoa('https://api.kraken.com/0/public'),
  MEMPOOL: btoa('https://mempool.space/api/v1')
};

// Headers sécurisés
export const SECURE_HEADERS = {
  'Accept': 'application/json',
  'Cache-Control': 'no-cache',
  'X-Security-Token': generateSecurityToken()
};

// Fonction pour générer un token de sécurité
function generateSecurityToken(): string {
  return btoa(Date.now().toString() + Math.random().toString(36).substring(7));
}

// Fonction pour décoder les URLs en toute sécurité
export function decodeSecureUrl(encodedUrl: string): string {
  try {
    return atob(encodedUrl);
  } catch {
    return '';
  }
}