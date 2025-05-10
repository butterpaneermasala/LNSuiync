import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import dotenv from 'dotenv';

dotenv.config();

const PROTO_PATH = './rpc.proto';  // Path to your LND gRPC Proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const lndProto = grpc.loadPackageDefinition(packageDefinition).lnrpc;

export const getLightningClient = () => {
  return new lndProto.Lightning(
    `${process.env.LND_HOST}:${process.env.LND_PORT}`,
    {
      'grpc.ssl_target_name_override': process.env.LND_SSL_OVERRIDE,
      'credentials': grpc.credentials.createSsl(
        Buffer.from(process.env.LND_TLS_CERT, 'base64')
      ),
    }
  );
};
