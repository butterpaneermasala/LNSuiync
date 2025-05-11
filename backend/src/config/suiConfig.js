import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';

dotenv.config();

export const getSigner = async () => {
  const base64Key = process.env.SUI_PRIVATE_KEY;
  const rpcUrl = process.env.SUI_RPC;
  if (!base64Key || !rpcUrl) {
    throw new Error('Missing SUI_PRIVATE_KEY or SUI_RPC');
  }
  console.log('SUI_PRIVATE_KEY:', base64Key);
  const secretKeyBytes = fromBase64(base64Key);
  let secretKey;

  if (secretKeyBytes.length === 64 || secretKeyBytes.length === 65) {
    // Format: [optional scheme byte] + [32-byte secret key] + [32-byte public key]
    secretKey = secretKeyBytes.slice(1, 33); // skip scheme byte
  } else if (secretKeyBytes.length === 32) {
    secretKey = secretKeyBytes; // raw secret key
  } else {
    throw new Error(`Invalid secret key length: expected 32, 64, or 65 bytes, got ${secretKeyBytes.length}`);
  }

  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  const client = new SuiClient({ url: rpcUrl });

  return {
    keypair,
    client,
    address: keypair.getPublicKey().toSuiAddress(),
  };
};
