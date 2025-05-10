import { getSigner } from '../config/suiConfig.js';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export const mintTokens = async (amountPaid) => {
  const signer = await getSigner();

  // Convert satoshis to your token's smallest unit (adjust as needed)
  const amountInTokens = amountPaid / 100000000; // Adjust conversion factor if necessary

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::${process.env.MODULE}::mint`,
    arguments: [
      tx.object(process.env.TREASURY_CAP_OBJECT_ID),
      tx.pure(amountInTokens),
      tx.pure(process.env.RECIPIENT_ADDRESS),
    ],
  });

  try {
    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
    console.log('Mint transaction successful:', result.digest);
  } catch (err) {
    console.error('Minting failed:', err);
  }
};
