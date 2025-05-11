import { getSigner } from '../config/suiConfig.js';
import { Transaction } from '@mysten/sui/transactions';
import { logInfo, logError } from '../utils/logger.js';
import { bcs } from '@mysten/sui/bcs'; // Import BCS for serialization

export const mintTokens = async (amountPaid) => {
    logInfo(`Starting mintTokens function with amountPaid: ${amountPaid}`);

    const signer = await getSigner();

    // Use BigInt to represent amount accurately for u64
    const amountInTokens = BigInt(amountPaid); // Assuming amountPaid is in smallest units already
    logInfo(`Converted amountInTokens: ${amountInTokens.toString()}`);

    const tx = new Transaction();
    tx.moveCall({
        target: `${process.env.PACKAGE_ID}::${process.env.MODULE}::mint`,
        arguments: [
            tx.object(process.env.TREASURY_CAP_OBJECT_ID),
            tx.pure.u64(amountInTokens), // Correct way for u64
            tx.pure.address(process.env.RECIPIENT_ADDRESS), // Correct way for address
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
        logError(`Error details: ${JSON.stringify(err, null, 2)}`);
    }
};
