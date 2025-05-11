import lnService from 'ln-service';
import fs from 'fs';

async function main() {
    try {
        const tls = fs.readFileSync('/home/satya/.polar/networks/1/volumes/lnd/alice/tls.cert');
        const macaroon = fs.readFileSync('/home/satya/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon');
        const socket = '127.0.0.1:10001';

        const { lnd } = await lnService.authenticatedLndGrpc({
            socket,
            cert: tls,
            macaroon,
        });

        const amount = parseInt(prompt('Enter the amount in satoshis:'), 10);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid amount entered. Please enter a positive number.');
        }

        const { request, id } = await lnService.createInvoice({ lnd, tokens: amount });
        console.log('LN Invoice (BOLT11):', request);

        const sub = lnService.subscribeToInvoice({ lnd, id });
        sub.on('invoice_updated', invoice => {
            if (invoice.is_confirmed) {
                console.log('✅ Lightning payment received!');
                mintTokens(amount);
                sub.removeAllListeners(); // Optional: stop listening after it's paid
            }
        });
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

async function mintTokens(amount) {
    console.log(`Minting tokens for amount: ${amount} satoshis`);
    // Add your Sui minting logic here
}

main();