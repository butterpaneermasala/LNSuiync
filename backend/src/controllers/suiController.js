import { mintTokens } from '../services/suiService.js';
import { logInfo, logError } from '../utils/logger.js';

export const mintSuiTokens = (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    logError('Amount is required to mint tokens');
    return res.status(400).json({ error: 'Amount is required to mint tokens' });
  }

  try {
    logInfo(`Minting tokens with amount: ${amount}`);
    mintTokens(amount);
    logInfo('Tokens minted successfully');
    res.status(200).json({ success: true, message: 'Tokens minted successfully' });
  } catch (error) {
    logError(`Minting failed: ${error.message}`);
    res.status(500).json({ error: 'Minting failed', details: error.message });
  }
};
