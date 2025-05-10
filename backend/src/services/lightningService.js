// lightningService.js - Enhanced for proto compatibility
import { getLightningClient } from '../config/lightningConfig.js';
import { mintTokens } from './suiService.js';
import { logInfo, logError, logEnvVariables } from '../utils/logger.js';

logEnvVariables();

export const handlePayment = async () => {
  try {
    const client = getLightningClient();
    
    logInfo('Checking available methods on Lightning client');
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client))
      .filter(name => typeof client[name] === 'function' && name !== 'constructor');
    logInfo(`Available methods: ${JSON.stringify(methods)}`);
    
    // Check which subscription method is available
    const subscribeMethod = typeof client.subscribeInvoices === 'function' 
      ? 'subscribeInvoices' 
      : typeof client.SubscribeInvoices === 'function'
        ? 'SubscribeInvoices'
        : null;
        
    if (!subscribeMethod) {
      throw new Error('No invoice subscription method found on Lightning client');
    }
    
    logInfo(`Using ${subscribeMethod} method to listen for Lightning payment events...`);
    
    // Create subscription with basic options first
    let stream;
    try {
      if (subscribeMethod === 'subscribeInvoices') {
        // Try with minimal parameters first
        stream = client.subscribeInvoices({});
      } else {
        stream = client.SubscribeInvoices({});
      }

      logInfo('Successfully created invoice subscription');
    } catch (error) {
      logError(`Error creating invoice subscription with empty params: ${error.message}`);
      
      // Try alternative approach with add_index parameter as number
      try {
        logInfo('Trying alternative subscription approach with numeric add_index');
        if (subscribeMethod === 'subscribeInvoices') {
          stream = client.subscribeInvoices({ add_index: 0 });
        } else {
          stream = client.SubscribeInvoices({ add_index: 0 });
        }
        logInfo('Successfully created invoice subscription with numeric add_index');
      } catch (altError) {
        logError(`Error creating invoice subscription with numeric add_index: ${altError.message}`);
        
        // Try with string parameter as last resort
        try {
          logInfo('Trying last resort subscription approach with string add_index');
          if (subscribeMethod === 'subscribeInvoices') {
            stream = client.subscribeInvoices({ add_index: '0' });
          } else {
            stream = client.SubscribeInvoices({ add_index: '0' });
          }
          logInfo('Successfully created invoice subscription with string add_index');
        } catch (finalError) {
          logError(`All subscription attempts failed: ${finalError.message}`);
          throw finalError;
        }
      }
    }

    // Set up data handler with robust parsing
    stream.on('data', (invoice) => {
      logInfo(`Received full invoice data: ${JSON.stringify(invoice)}`);
      
      // Check all possible fields for settlement status
      const isSettled = Boolean(
        invoice.settled || 
        invoice.is_settled || 
        invoice.state === 'SETTLED'
      );

      if (isSettled) {
        logInfo(`Invoice settled: ${JSON.stringify(invoice)}`);

        const amountPaid = 
          invoice.amt_paid_sat || 
          invoice.value_sat || 
          invoice.amount_paid || 
          invoice.value ||
          (invoice.amt_paid_msat ? Math.floor(parseInt(invoice.amt_paid_msat, 10) / 1000) : null) ||
          (invoice.value_msat ? Math.floor(parseInt(invoice.value_msat, 10) / 1000) : null);

        if (!amountPaid) {
          logError('Amount paid is missing in the invoice. Available fields:');
          logError(JSON.stringify(Object.keys(invoice)));
          return;
        }

        const amountPaidNum = typeof amountPaid === 'string' ? parseInt(amountPaid, 10) : amountPaid;
        logInfo(`Processing payment of ${amountPaidNum} satoshis`);

        try {
          mintTokens(amountPaidNum);
        } catch (mintError) {
          logError(`Error minting tokens: ${mintError.message}`);
        }
      } else {
        logInfo('Invoice is not settled yet.');
      }
    });

    // Set up error handler with reconnection logic
    stream.on('error', (err) => {
      logError(`Error listening for payments: ${err.message}`);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        logInfo('Attempting to reconnect to Lightning payment stream...');
        handlePayment();
      }, 10000); // 10 second reconnection delay
    });

    // Set up end handler
    stream.on('end', () => {
      logInfo('Payment stream ended.');
      
      // Attempt to reconnect
      setTimeout(() => {
        logInfo('Attempting to reconnect to Lightning payment stream...');
        handlePayment();
      }, 5000); // 5 second reconnection delay
    });
    
    return stream;
  } catch (error) {
    logError(`Failed to start payment listening: ${error.message}`);
    logError(`Stack trace: ${error.stack}`);
    
    // Attempt to restart after a delay
    setTimeout(() => {
      logInfo('Attempting to restart payment listening...');
      handlePayment();
    }, 15000); // 15 second restart delay
    
    return null;
  }
};

// New helper function to create an invoice
export const createInvoice = async (amount, memo = 'LN-Sui Bridge Payment') => {
  try {
    const client = getLightningClient();
    
    // Check which method is available
    const createMethod = typeof client.addInvoice === 'function' 
      ? 'addInvoice' 
      : typeof client.AddInvoice === 'function'
        ? 'AddInvoice'
        : null;
        
    if (!createMethod) {
      throw new Error('No invoice creation method found on Lightning client');
    }
    
    return new Promise((resolve, reject) => {
      // Convert amount to appropriate type based on what LND expects
      const invoiceRequest = {
        value: amount.toString(),
        memo: memo
      };
      
      client[createMethod](invoiceRequest, (err, response) => {
        if (err) {
          logError(`Error creating invoice: ${err.message}`);
          reject(err);
        } else {
          logInfo(`Invoice created with payment hash: ${response.r_hash}`);
          resolve(response);
        }
      });
    });
  } catch (error) {
    logError(`Failed to create invoice: ${error.message}`);
    throw error;
  }
};