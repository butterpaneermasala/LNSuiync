import dotenv from 'dotenv';
import fs from 'fs';

// Explicitly load the .env file
const result = dotenv.config({ path: '../../backend/.env' });
if (result.error) {
  console.error('[ERROR] Failed to load .env file:', result.error);
}

const logFile = 'app.log';

export const logInfo = (message) => {
  const logMessage = `[INFO] ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage);
};

export const logError = (message) => {
  const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.error(logMessage);
};

export const logEnvVariables = () => {
  logInfo(`Environment Variables Loaded: LND_HOST=${process.env.LND_HOST}`);
};