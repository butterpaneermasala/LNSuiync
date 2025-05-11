// lightningConfig.js - More robust LND client configuration
import lnService from 'ln-service';
import { logInfo, logError } from '../utils/logger.js';
import tls from 'tls';
import fs from 'fs';
import path from 'path';

let lnd = null;

export const getLightningClient = () => {
  if (lnd) {
    return lnd;
  }

  try {
    logInfo('Initializing Lightning client using ln-service...');

    // Load TLS certificate and macaroon directly from file paths
    const cert = fs.readFileSync('/home/satya/.polar/networks/1/volumes/lnd/alice/tls.cert', 'utf-8');
    const macaroon = fs.readFileSync('/home/satya/.polar/networks/1/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon').toString('hex');

    const { lnd: authenticatedLnd } = lnService.authenticatedLndGrpc({
      socket: '127.0.0.1:10001',
      cert,
      macaroon,
    });

    lnd = authenticatedLnd;
    logInfo('Lightning client initialized successfully using ln-service.');
    return lnd;
  } catch (error) {
    logError(`Failed to initialize Lightning client: ${error.message}`);
    throw error;
  }
};

// Remove NODE_TLS_REJECT_UNAUTHORIZED override for better security
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

/**
 * Reset the Lightning client (for reconnection)
 */
export function resetLightningClient() {
  lnd = null;
}