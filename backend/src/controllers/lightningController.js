import { handlePayment } from '../services/lightningService.js';

export const startPaymentListening = (req, res) => {
  try {
    // Start listening for Lightning payments
    handlePayment();
    res.status(200).json({ success: true, message: 'Started listening for payments' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to listen for payments', details: error.message });
  }
};
