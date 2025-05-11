import { getKeypairAndClient } from '../config/suiConfig.js';
import { Transaction } from '@mysten/sui/transactions';
import { logInfo, logError } from '../utils/logger.js';
import { bcs } from '@mysten/sui/bcs'; // Import BCS for serialization

export const mintTokens = async (amountPaid) => {
    logInfo(`Starting mintTokens function with amountPaid: ${amountPaid}`);

    const { keypair, client } = await getKeypairAndClient();

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
    executeTx(txb);
  

    try {
        logInfo('Executing transaction...');
        const result = await client.signAndExecuteTransaction({
          transaction: tx,
          signer: keypair,
          options: { showEffects: true, showObjectChanges: true },
        });
    } catch (err) {
        logError(`Minting failed: ${err.message}`);
        logError(`Error details: ${JSON.stringify(err, null, 2)}`);
    }
};

async function executeTx(txb: Transaction) {
  const suiClient = new SuiClient({ url: SUI_NETWORK });
  if (!ADMIN_SECRET_KEY) throw new Error("ADMIN_SECRET_KEY environment variable is not set.");
  const adminKeypair = Ed25519Keypair.fromSecretKey(ADMIN_SECRET_KEY);

  txb.setGasBudget(1000000000);

  suiClient.signAndExecuteTransaction({
      signer: adminKeypair,
      transaction: txb,
      requestType: 'WaitForLocalExecution',
      options: {
          showEvents: true,
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
          showInput: true,
      }
  }).then((res) => {
      const status = res?.effects?.status.status;
      console.log("TxDigest = ", res?.digest);
      console.log("Status = ", status);
      if (status === "success") {
          console.log("Transaction executed successfully.");
      }
      if (status == "failure") {
          console.log("Transaction error = ", res?.effects?.status);
      }
  });
}
