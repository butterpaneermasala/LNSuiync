import lnService from 'ln-service';
import { mintTokens } from './services/suiService.js';
import promptSync from 'prompt-sync'; // Correct import
import { getLightningClient } from './config/lightningConfig.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/generate-invoice', async (req, res) => {
    const { amount, recipientAddress } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!recipientAddress) {
        return res.status(400).json({ error: 'Invalid recipient address' });
    }

    try {
        const lnd = getLightningClient();
        const { request, id } = await lnService.createInvoice({ lnd, tokens: amount });

        const sub = lnService.subscribeToInvoice({ lnd, id });
        sub.on('invoice_updated', async (invoice) => {
            if (invoice.is_confirmed) {
                console.log('✅ Lightning payment received!');
                await mintTokens(amount, recipientAddress);
                sub.removeAllListeners();
            }
        });

        res.json({ invoice: request, status: 'pending' });
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});

const prompt = promptSync(); // Initialize prompt-sync

async function main() {
    try {
        const lnd = getLightningClient();

        const amount = parseInt(prompt('Enter the amount in satoshis:'), 10);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Invalid amount entered. Please enter a positive number.');
        }

        const { request, id } = await lnService.createInvoice({ lnd, tokens: amount });
        console.log('LN Invoice (BOLT11):', request);

        const sub = lnService.subscribeToInvoice({ lnd, id });
        sub.on('invoice_updated', async (invoice) => {
            if (invoice.is_confirmed) {
                console.log('✅ Lightning payment received!');
                await mintTokens(amount);
                sub.removeAllListeners(); // Optional: stop listening after it's paid
            }
        });
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

main();