import express from 'express';
import dotenv from 'dotenv';
import lightningRoutes from './routes/lightningRoutes.js';
import suiRoutes from './routes/suiRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/lightning', lightningRoutes);
app.use('/api/sui', suiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
