// constants.js
import dotenv from 'dotenv';
import { bech32 } from '@scure/base';
import { Buffer } from 'buffer';
dotenv.config();

export const SUI_NETWORK = process.env.SUI_RPC;
export const PACKAGE_ID = process.env.PACKAGE_ID;
export const MODULE = process.env.MODULE;
export const COIN_TYPE = process.env.COIN_TYPE;
export const TREASURY_CAP_OBJECT_ID = process.env.TREASURY_CAP_OBJECT_ID;
export const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;

function fromBech32(bech32Key) {
    const decoded = bech32.decode(bech32Key);
    const bytes = new Uint8Array(bech32.fromWords(decoded.words));
    return bytes.length === 33 ? bytes.slice(1) : bytes;
}

let adminSecretKeyBytes = null;
if (process.env.SUI_PRIVATE_KEY) {
    if (process.env.SUI_PRIVATE_KEY.startsWith('sui')) {
        adminSecretKeyBytes = fromBech32(process.env.SUI_PRIVATE_KEY);
    } else {
        adminSecretKeyBytes = Uint8Array.from(Buffer.from(process.env.SUI_PRIVATE_KEY, 'base64'));
    }
}

export const ADMIN_SECRET_KEY = adminSecretKeyBytes;
