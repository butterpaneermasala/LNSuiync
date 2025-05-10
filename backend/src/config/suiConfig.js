import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';

dotenv.config();

export const getSigner = async () => {
  if (!process.env.SUI_PRIVATE_KEY || !process.env.SUI_RPC) {
    throw new Error('Missing SUI_PRIVATE_KEY or SUI_RPC in environment variables');
  }

  const keypair = Ed25519Keypair.fromSecretKey(
    fromBase64(process.env.SUI_PRIVATE_KEY)
  );

  const client = new SuiClient({
    url: process.env.SUI_RPC,
  });

  return {
    keypair,
    client,
    address: keypair.getPublicKey().toSuiAddress(),
  };
};
