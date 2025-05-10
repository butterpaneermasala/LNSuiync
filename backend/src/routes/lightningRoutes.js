import express from 'express';
import { startPaymentListening } from '../controllers/lightningController.js';

const router = express.Router();

router.post('/start-listening', startPaymentListening);

export default router;
