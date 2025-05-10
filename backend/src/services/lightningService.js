import { getLightningClient } from '../config/lightningConfig.js';
import { mintSuiTokens } from './suiService.js';

export const handlePayment = async () => {
  const client = getLightningClient();

  // Listen for Lightning payment events
  const stream = client.SubscribeInvoices({ add_index: '0' });

  stream.on('data', (invoice) => {
    if (invoice.settled) {
      console.log('Payment received:', invoice);
      
      // Handle the payment and mint corresponding Sui tokens
      const amountPaid = invoice.amount_paid;  // Amount in satoshis
      mintSuiTokens(amountPaid);
    }
  });

  stream.on('error', (err) => {
    console.error('Error listening for payments:', err);
  });
};
