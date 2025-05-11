import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64, fromHex } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import { bech32 } from '@scure/base';
import dotenv from 'dotenv';

dotenv.config();

const fromBech32 = (bech32Key) => {
  const decoded = bech32.decode(bech32Key);
  const bytes = new Uint8Array(bech32.fromWords(decoded.words));
  if (bytes.length === 33) return bytes.slice(1);
  return bytes;
};

export const getKeypairAndClient = () => {
  const privateKey = process.env.SUI_PRIVATE_KEY;
  const rpcUrl = process.env.SUI_RPC;

  if (!privateKey || !rpcUrl) {
    throw new Error('Missing SUI_PRIVATE_KEY or SUI_RPC');
  }

  let secretKeyBytes;
  if (privateKey.startsWith('sui')) {
    secretKeyBytes = fromBech32(privateKey);
  } else if (privateKey.match(/^[0-9a-fA-F]+$/)) {
    secretKeyBytes = fromHex(privateKey);
  } else {
    secretKeyBytes = fromBase64(privateKey);
  }

  if (secretKeyBytes.length !== 32) {
    throw new Error(`Invalid secret key length: expected 32 bytes, got ${secretKeyBytes.length}`);
  }

  const keypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
  const client = new SuiClient({ url: rpcUrl });
  return { keypair, client };
};
