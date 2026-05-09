import { Request, Response } from 'express';
import Element from '../models/Element';
import Compound from '../models/Compound';

// GET /api/elements
export async function getAllElements(req: Request, res: Response): Promise<void> {
  try {
    const category = req.query.category as string | undefined;
    const period = req.query.period as string | undefined;
    const block = req.query.block as string | undefined;
    const search = req.query.search as string | undefined;
    const page = (req.query.page as string) || '1';
    const limit = (req.query.limit as string) || '20';

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (period) filter.period = Number(period);
    if (block) filter.block = block;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [elements, total] = await Promise.all([
      Element.find(filter)
        .select('-earthExamples -englishWords -bohrShells')
        .sort({ atomicNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Element.countDocuments(filter),
    ]);

    res.json({
      data: elements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch elements' });
  }
}

// GET /api/elements/:atomicNumber
export async function getElementById(req: Request, res: Response): Promise<void> {
  try {
    const atomicNumber = req.params['atomicNumber'] as string;
    const element = await Element.findOne({ atomicNumber: Number(atomicNumber) });
    if (!element) {
      res.status(404).json({ error: 'Element not found' });
      return;
    }
    res.json({ data: element });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch element' });
  }
}

// GET /api/elements/symbol/:symbol
export async function getElementBySymbol(req: Request, res: Response): Promise<void> {
  try {
    const symbol = req.params['symbol'] as string;
    const element = await Element.findOne({ symbol: symbol.toUpperCase() });
    if (!element) {
      res.status(404).json({ error: 'Element not found' });
      return;
    }
    res.json({ data: element });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch element' });
  }
}

// GET /api/elements/:atomicNumber/bohr
export async function getBohrModel(req: Request, res: Response): Promise<void> {
  try {
    const atomicNumber = req.params['atomicNumber'] as string;
    const element = await Element.findOne({ atomicNumber: Number(atomicNumber) })
      .select('symbol name atomicNumber protons neutrons electrons bohrShells');
    if (!element) {
      res.status(404).json({ error: 'Element not found' });
      return;
    }
    res.json({
      data: {
        symbol: element.symbol,
        name: element.name,
        atomicNumber: element.atomicNumber,
        nucleus: { protons: element.protons, neutrons: element.neutrons },
        shells: element.bohrShells,
        totalElectrons: element.electrons,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Bohr model' });
  }
}

// GET /api/elements/:atomicNumber/compounds
export async function getElementCompounds(req: Request, res: Response): Promise<void> {
  try {
    const atomicNumber = req.params['atomicNumber'] as string;
    const element = await Element.findOne({ atomicNumber: Number(atomicNumber) }).select('symbol');
    if (!element) {
      res.status(404).json({ error: 'Element not found' });
      return;
    }
    const compounds = await Compound.find({ 'elements.symbol': element.symbol }).sort({ difficulty: 1 });
    res.json({ data: compounds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compounds' });
  }
}

// GET /api/elements/categories
export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await Element.distinct('category');
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
