// import { getKeypairAndClient } from '../config/suiConfig.js';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { logInfo, logError } from '../utils/logger.js';
import {
    ADMIN_SECRET_KEY,
    SUI_NETWORK,
    TREASURY_CAP_OBJECT_ID,
    PACKAGE_ID,
    MODULE,
    RECIPIENT_ADDRESS,
} from '../config/suiConfig.js'; 

export const mintTokens = async (amountPaid, recipientAddress) => {
    logInfo(`Starting mintTokens function with amountPaid: ${amountPaid} and recipientAddress: ${recipientAddress}`);

    if (!TREASURY_CAP_OBJECT_ID || !PACKAGE_ID || !MODULE) {
        throw new Error("Required environment variables are not set.");
    }

    const txb = new Transaction();
    const amountInTokens = BigInt(amountPaid);
    logInfo(`Converted amountInTokens: ${amountInTokens.toString()}`);

    txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::mint`,
        arguments: [
            txb.object(TREASURY_CAP_OBJECT_ID),    // Treasury cap object ID
            txb.pure.u64(amountInTokens),          // Amount to mint
            txb.pure.address(recipientAddress),    // Recipient address
        ],
    });    

    // txb.transferObjects([coin], txb.pure.address(RECIPIENT_ADDRESS));

    await executeTx(txb);
};

async function executeTx(txb) {
    logInfo(`Connecting to Sui network: ${SUI_NETWORK}`);
    const suiClient = new SuiClient({ url: SUI_NETWORK });

    if (!ADMIN_SECRET_KEY) throw new Error("ADMIN_SECRET_KEY environment variable is not set.");

    const adminKeypair = Ed25519Keypair.fromSecretKey(ADMIN_SECRET_KEY);
    txb.setGasBudget(3000000);

    try {
        const res = await suiClient.signAndExecuteTransaction({
            signer: adminKeypair,
            transaction: txb,
            requestType: 'WaitForLocalExecution',
            options: {
                showEvents: true,
                showEffects: true,
                showObjectChanges: true,
                showBalanceChanges: true,
                showInput: true,
            },
        });

        const status = res?.effects?.status.status;
        console.log("TxDigest = ", res?.digest);
        console.log("Status = ", status);

        if (status === "success") {
            console.log("Transaction executed successfully.");
        } else {
            console.error("Transaction failed: ", res?.effects?.status);
        }
    } catch (err) {
        logError(`Transaction execution failed: ${err.message}`);
        logError(`Error details: ${JSON.stringify(err, null, 2)}`);
    }
}
