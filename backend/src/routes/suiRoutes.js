import express from 'express';
import { mintSuiTokens } from '../controllers/suiController.js';

const router = express.Router();

router.post('/mint-tokens', mintSuiTokens);

export default router;
