import express from 'express';
import { createInvoice, startPaymentListener, checkInvoiceStatus } from '../services/lightningService.js';
import { logInfo, logError } from '../utils/logger.js';

const router = express.Router();

// Create invoice endpoint
router.post('/create-invoice', async (req, res) => {
  try {
    const { amount, memo } = req.body;

    if (!amount || isNaN(parseInt(amount, 10))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const invoice = await createInvoice(parseInt(amount, 10), memo || 'LN-Sui Bridge Payment');
    res.status(201).json(invoice);
  } catch (error) {
    logError(`Error creating invoice: ${error.message}`);
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  }
});

// Start payment listening endpoint
router.post('/start-listening', async (req, res) => {
  try {
    const stream = await startPaymentListener();
    if (stream) {
      res.status(200).json({ success: true, message: 'Started listening for payments' });
    } else {
      res.status(500).json({ error: 'Failed to start payment listener' });
    }
  } catch (error) {
    logError(`Error starting payment listener: ${error.message}`);
    res.status(500).json({ error: 'Failed to listen for payments', details: error.message });
  }
});

// Check invoice status endpoint
router.get('/check-invoice/:paymentHash', async (req, res) => {
  try {
    const paymentHash = req.params.paymentHash;
    const invoice = await checkInvoiceStatus(paymentHash);

    res.json({
      payment_hash: paymentHash,
      status: invoice.is_confirmed ? 'SETTLED' : 'UNPAID',
      amount_paid: invoice.received || 0,
      details: invoice
    });
  } catch (error) {
    logError(`Error checking invoice status: ${error.message}`);
    res.status(500).json({ error: 'Failed to check invoice', details: error.message });
  }
});

export default router;

