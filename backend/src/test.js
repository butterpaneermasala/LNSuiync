import { logInfo, logError, logEnvVariables } from './utils/logger.js';

logEnvVariables();

const client = getLightningClient();

logInfo('Connecting to Lightning node...');
client.getInfo({}, (err, response) => {
  if (err) {
    logError(`Error connecting to Lightning node: ${err}`);
  } else {
    logInfo(`Lightning node info: ${JSON.stringify(response)}`);
  }
});