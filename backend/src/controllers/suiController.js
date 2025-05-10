import { mintTokens } from '../services/suiService.js';

export const mintSuiTokens = (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required to mint tokens' });
  }

  try {
    mintTokens(amount);
    res.status(200).json({ success: true, message: 'Tokens minted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Minting failed', details: error.message });
  }
};
