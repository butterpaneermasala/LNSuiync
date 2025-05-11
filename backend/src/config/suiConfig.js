import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64, fromHex } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import { bech32 } from '@scure/base';
import { RawSigner } from '@mysten/sui/raw-signer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Decodes a bech32 encoded private key
 * @param {string} bech32Key - The bech32 encoded private key
 * @returns {Uint8Array} - The decoded private key bytes
 */
const fromBech32 = (bech32Key) => {
  try {
    // Decode the bech32 string
    const decoded = bech32.decode(bech32Key);
    // Convert the 5-bit words to bytes (8-bit)
    const bytes = new Uint8Array(bech32.fromWords(decoded.words));
    
    // If we got 33 bytes and the first byte is 0x00 or 0x01 (likely a key type prefix),
    // return just the 32 byte key (skip the first byte)
    if (bytes.length === 33) {
      return bytes.slice(1);
    }
    
    return bytes;
  } catch (error) {
    throw new Error(`Invalid bech32 key: ${error.message}`);
  }
};

/**
 * Gets a signer from environment variables
 * @returns {Promise<{keypair: Ed25519Keypair, client: SuiClient, address: string}>}
 */
export const getSigner = async () => {
  const privateKey = process.env.SUI_PRIVATE_KEY;
  const rpcUrl = process.env.SUI_RPC;
  
  if (!privateKey || !rpcUrl) {
    throw new Error('Missing SUI_PRIVATE_KEY or SUI_RPC');
  }

  let secretKeyBytes;
  
  // Detect encoding format based on key structure
  if (privateKey.startsWith('sui')) {
    // Bech32 encoded key
    secretKeyBytes = fromBech32(privateKey);
  } else if (privateKey.match(/^[0-9a-fA-F]+$/)) {
    // Hex encoded key
    secretKeyBytes = fromHex(privateKey);
  } else {
    // Base64 encoded key (fallback)
    try {
      secretKeyBytes = fromBase64(privateKey);
    } catch (error) {
      throw new Error(`Unsupported key format. Expected bech32, hex, or base64: ${error.message}`);
    }
  }

  console.log('Secret Key Bytes length:', secretKeyBytes.length);
  
  // Add extra debugging to help troubleshoot
  if (privateKey.startsWith('sui')) {
    console.log('Detected bech32 key format');
  }
  
  if (secretKeyBytes.length !== 32) {
    throw new Error(`Invalid secret key length: expected 32 bytes, got ${secretKeyBytes.length}`);
  }

  const keypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
  const client = new SuiClient({ url: rpcUrl });

  const rawSigner = new RawSigner(keypair, client);
  return rawSigner;
};