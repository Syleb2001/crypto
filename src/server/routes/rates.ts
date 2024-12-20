import express from 'express';
import { cacheMiddleware } from '../middleware/cache';
import { exchangeService } from '../services/exchangeService';

const router = express.Router();

router.get('/rates', cacheMiddleware(), async (req, res) => {
  try {
    const rates = await exchangeService.getAllRates();
    res.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

export default router;