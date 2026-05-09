import { Request, Response } from 'express';
import Compound from '../models/Compound';

// GET /api/compounds
export async function getAllCompounds(req: Request, res: Response): Promise<void> {
  try {
    const difficulty = req.query.difficulty as string | undefined;
    const element = req.query.element as string | undefined;
    const search = req.query.search as string | undefined;
    const page = (req.query.page as string) || '1';
    const limit = (req.query.limit as string) || '20';

    const filter: Record<string, unknown> = {};
    if (difficulty) filter.difficulty = difficulty;
    if (element) filter['elements.symbol'] = element.toUpperCase();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { formula: { $regex: search, $options: 'i' } },
        { commonName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [compounds, total] = await Promise.all([
      Compound.find(filter)
        .sort({ formula: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Compound.countDocuments(filter),
    ]);

    res.json({
      data: compounds,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compounds' });
  }
}

// GET /api/compounds/:id
export async function getCompoundById(req: Request, res: Response): Promise<void> {
  try {
    const compound = await Compound.findById(req.params['id'] as string);
    if (!compound) {
      res.status(404).json({ error: 'Compound not found' });
      return;
    }
    res.json({ data: compound });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compound' });
  }
}

// GET /api/compounds/formula/:formula
export async function getCompoundByFormula(req: Request, res: Response): Promise<void> {
  try {
    const compound = await Compound.findOne({ formula: req.params['formula'] as string });
    if (!compound) {
      res.status(404).json({ error: 'Compound not found' });
      return;
    }
    res.json({ data: compound });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compound' });
  }
}
