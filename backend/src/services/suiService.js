import { getSigner } from '../config/suiConfig.js';
import { Transaction } from '@mysten/sui/transactions';
import { logInfo, logError, logEnvVariables } from '../utils/logger.js';

logEnvVariables();

export const mintTokens = async (amountPaid) => {
  logInfo(`Starting mintTokens function with amountPaid: ${amountPaid}`);

  const signer = await getSigner();

  const amountInTokens = amountPaid / 100000000;
  logInfo(`Converted amountInTokens: ${amountInTokens}`);

  const tx = new Transaction();
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::${process.env.MODULE}::mint`,
    arguments: [
      tx.object(process.env.TREASURY_CAP_OBJECT_ID),
      tx.pure(amountInTokens),
      tx.pure(process.env.RECIPIENT_ADDRESS),
    ],
  });

  try {
    logInfo('Executing transaction...');
    const result = await signer.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showEvents: true },
    });
    logInfo(`Mint transaction successful: ${result.digest}`);
  } catch (err) {
    logError(`Minting failed: ${err.message}`);
    logError(`Error details: ${JSON.stringify(err)}`);
  }
};
