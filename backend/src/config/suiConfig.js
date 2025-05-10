import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { signer } from '@mysten/sui.js/transactions';
import { jsonRpc } from '@mysten/sui.js/client';
import { fromB64 } from '@mysten/sui.js/utils';
import dotenv from 'dotenv';

dotenv.config();

export const getSigner = async () => {
  // Create provider directly with the RPC URL
  const provider = new jsonRpc({ url: process.env.SUI_RPC });

  const keypair = Ed25519Keypair.fromSecretKey(fromB64(process.env.SUI_PRIVATE_KEY));
  return new signer(keypair, provider);
};