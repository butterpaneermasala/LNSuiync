// app.js - Compatible with different LND versions
import express from 'express';
import dotenv from 'dotenv';
import lightningRoutes from './routes/lightningRoutes.js';
import suiRoutes from './routes/suiRoutes.js';
import { handlePayment } from './services/lightningService.js';
import { getLightningClient } from './config/lightningConfig.js';
import { logError, logInfo } from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use('/api/lightning', lightningRoutes);
app.use('/api/sui', suiRoutes);

logInfo('Starting backend server...');

// Check proto file location
const protoPath = path.resolve(__dirname, '../protos/rpc.proto');
logInfo(`Proto file path: ${protoPath}`);
if (fs.existsSync(protoPath)) {
  logInfo(`Proto file exists at: ${protoPath}`);
} else {
  logError(`Proto file does not exist at: ${protoPath}`);
  logInfo(`Current directory: ${__dirname}`);
  logInfo(`Checking parent directories...`);
  
  // Try to find proto files in parent directories
  let foundProtos = false;
  let currentDir = __dirname;
  for (let i = 0; i < 5; i++) { // Check up to 5 levels up
    currentDir = path.resolve(currentDir, '..');
    const possibleProtoDir = path.join(currentDir, 'protos');
    if (fs.existsSync(possibleProtoDir)) {
      logInfo(`Found potential proto directory at: ${possibleProtoDir}`);
      foundProtos = true;
      
      // Check for rpc.proto files
      const files = fs.readdirSync(possibleProtoDir);
      logInfo(`Files in directory: ${files.join(', ')}`);
      break;
    }
  }
  
  if (!foundProtos) {
    logError(`Could not find protos directory in parent directories`);
  }
}

// Try to initialize the Lightning client with multiple fallbacks
let client;
try {
  client = getLightningClient();
  logInfo('Lightning client initialized successfully');
  
  // First try the simpler approach - start payment listening directly
  try {
    logInfo('Starting payment listening directly...');
    handlePayment();
  } catch (paymentError) {
    logError(`Error starting payment listening: ${paymentError.message}`);
    
    // If that fails, try with a different approach
    setTimeout(() => {
      logInfo('Retrying payment listening with different approach...');
      handlePayment();
    }, 5000);
  }
} catch (error) {
  logError(`Failed to initialize Lightning client: ${error.message}`);
  logError(`Stack trace: ${error.stack}`);
  
  // Provide information about what might have gone wrong
  logError('This could be due to:');
  logError('1. Missing or incorrect proto files');
  logError('2. Connection issues to the LND node');
  logError('3. Incompatible LND version');
  logError('4. Missing or invalid environment variables');
  
  logInfo('Checking environment variables for potential issues...');
  const lndHost = process.env.LND_HOST;
  const lndPort = process.env.LND_PORT;
  const hasCert = Boolean(process.env.LND_TLS_CERT);
  const hasMacaroon = Boolean(process.env.LND_MACAROON);
  
  logInfo(`Environment check: Host=${lndHost}, Port=${lndPort}, Has Cert=${hasCert}, Has Macaroon=${hasMacaroon}`);
}

// Add new diagnostic endpoint
app.get('/api/diagnostic', (req, res) => {
  // Check key files and environment
  const diagnosticInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      hasLndHost: Boolean(process.env.LND_HOST),
      hasLndPort: Boolean(process.env.LND_PORT),
      hasTlsCert: Boolean(process.env.LND_TLS_CERT),
      hasMacaroon: Boolean(process.env.LND_MACAROON),
      hasSuiRpc: Boolean(process.env.SUI_RPC),
      hasSuiPrivateKey: Boolean(process.env.SUI_PRIVATE_KEY),
      hasPackageId: Boolean(process.env.PACKAGE_ID),
      hasModule: Boolean(process.env.MODULE),
      hasTreasuryCap: Boolean(process.env.TREASURY_CAP_OBJECT_ID),
      hasRecipient: Boolean(process.env.RECIPIENT_ADDRESS)
    },
    files: {
      protoExists: fs.existsSync(path.resolve(__dirname, '../protos/rpc.proto')),
      routesExist: {
        lightning: fs.existsSync(path.resolve(__dirname, './routes/lightningRoutes.js')),
        sui: fs.existsSync(path.resolve(__dirname, './routes/suiRoutes.js'))
      },
      servicesExist: {
        lightning: fs.existsSync(path.resolve(__dirname, './services/lightningService.js')),
        sui: fs.existsSync(path.resolve(__dirname, './services/suiService.js'))
      }
    }
  };
  
  res.json(diagnosticInfo);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logInfo(`Backend server is running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError(`Uncaught exception: ${err.message}`);
  logError(`Stack trace: ${err.stack}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled promise rejection:');
  logError(`Reason: ${reason}`);
});