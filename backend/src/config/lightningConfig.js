// lightningConfig.js - Updated for proto mismatch
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logInfo, logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getLightningClient = () => {
  const lndHost = process.env.LND_HOST;
  const lndPort = process.env.LND_PORT;

  if (!lndHost || !lndPort) {
    throw new Error('LND_HOST or LND_PORT is not defined in environment variables');
  }

  const lndTarget = `${lndHost}:${lndPort}`;
  logInfo(`LND_HOST: ${lndHost}`);
  logInfo(`LND_PORT: ${lndPort}`);
  logInfo(`gRPC Target: ${lndTarget}`);

  // Check if the necessary environment variables are available
  if (!process.env.LND_TLS_CERT || !process.env.LND_MACAROON) {
    throw new Error('LND_TLS_CERT or LND_MACAROON is not defined in environment variables');
  }

  // Load certificate and macaroon
  const lndCert = Buffer.from(process.env.LND_TLS_CERT, 'base64');
  const macaroon = Buffer.from(process.env.LND_MACAROON, 'base64').toString('hex');

  // Create SSL credentials
  const credentials = grpc.credentials.createSsl(lndCert);
  
  // Add macaroon to metadata
  const metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  
  // Create metadata generator
  const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_, callback) => {
    callback(null, metadata);
  });

  // Combine credentials
  const combinedCreds = grpc.credentials.combineChannelCredentials(credentials, macaroonCreds);

  // Modified proto loading with specific options for compatibility
  const PROTO_PATH = path.resolve(__dirname, '../protos/rpc.proto');
  
  // Log proto file path
  logInfo(`Loading proto file from: ${PROTO_PATH}`);
  
  // Check if proto file exists
  if (!fs.existsSync(PROTO_PATH)) {
    logError(`Proto file not found at: ${PROTO_PATH}`);
    throw new Error(`Proto file not found at: ${PROTO_PATH}`);
  }

  // Load with more forgiving options for backwards compatibility
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [path.resolve(__dirname, '../protos')],
    // Don't fail on unknown fields - important for version mismatches
    ignoreUnknownFields: true
  });

  // Load Lightning service with better error handling
  let lnrpcDescriptor;
  try {
    lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
    logInfo('Successfully loaded gRPC package definition');
  } catch (error) {
    logError(`Failed to load gRPC package definition: ${error.message}`);
    throw error;
  }
  
  // Check if 'lnrpc' exists in the descriptor
  if (!lnrpcDescriptor.lnrpc) {
    logError('Failed to load lnrpc from proto definition');
    throw new Error('Failed to load lnrpc from proto definition. Check your proto file.');
  }
  
  // Log available services
  logInfo('Available services in proto:', Object.keys(lnrpcDescriptor.lnrpc));
  
  // Check for Lightning service
  if (!lnrpcDescriptor.lnrpc.Lightning) {
    logError('Lightning service not found in proto definition');
    throw new Error('Lightning service not found in proto definition');
  }

  // Create Lightning client with timeout
  const client = new lnrpcDescriptor.lnrpc.Lightning(lndTarget, combinedCreds, {
    'grpc.keepalive_time_ms': 10000,
    'grpc.keepalive_timeout_ms': 5000,
    'grpc.max_receive_message_length': 52428800, // 50MB
    'grpc.max_send_message_length': 52428800, // 50MB
    'grpc.enable_retries': 1,
    'grpc.service_config': JSON.stringify({
      'methodConfig': [{
        'name': [{'service': 'lnrpc.Lightning'}],
        'retryPolicy': {
          'maxAttempts': 5,
          'initialBackoff': '0.1s',
          'maxBackoff': '1s',
          'backoffMultiplier': 1.5,
          'retryableStatusCodes': ['UNAVAILABLE']
        }
      }]
    })
  });
  
  // Add timeout to all RPC methods
  const originalMethods = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(client))
    .filter(name => typeof client[name] === 'function' && name !== 'constructor')
    .forEach(methodName => {
      originalMethods[methodName] = client[methodName];
      client[methodName] = function(request, metadata, options, callback) {
        // Handle different parameter patterns
        if (typeof metadata === 'function') {
          callback = metadata;
          metadata = {};
          options = {};
        } else if (typeof options === 'function') {
          callback = options;
          options = {};
        }
        
        // Add deadline if not already set
        if (!options || !options.deadline) {
          options = {...options, deadline: Date.now() + 30000}; // 30 seconds timeout
        }
        
        // Call original method with deadline
        return originalMethods[methodName].call(this, request, metadata, options, callback);
      };
    });

  return client;
};