import { Router, Request, Response } from 'express';
import Biodiversity from '../models/Biodiversity';

const router = Router();

// GET all biodiversity data (with optional limit/query)
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const data = await Biodiversity.find().limit(limit);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk insert (for initial import)
router.post('/import', async (req: Request, res: Response) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Array of data required' });
    await Biodiversity.insertMany(req.body);
    res.json({ message: 'Data imported successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
