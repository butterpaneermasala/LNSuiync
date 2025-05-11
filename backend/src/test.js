import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';

dotenv.config();
const base64Key = process.env.SUI_PRIVATE_KEY;
const rpcUrl = process.env.SUI_RPC;
if (!base64Key || !rpcUrl) {
  throw new Error('Missing SUI_PRIVATE_KEY or SUI_RPC');
}

function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
}

if (!isValidBase64(base64Key)) {
  throw new Error('Invalid Base64 encoding for SUI_PRIVATE_KEY');
}

const secretKeyBytes = fromBase64(base64Key);
if (secretKeyBytes.length !== 32) {
  throw new Error(`Invalid secret key length: expected 32 bytes, got ${secretKeyBytes.length}`);
}