import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'periodic-language-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
}

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, alienSpecies } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ error: 'Username or email already in use' });
      return;
    }

    const user = await User.create({ username, email, password, alienSpecies: alienSpecies || null });
    const token = signToken(String(user._id));

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        alienSpecies: user.alienSpecies,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(String(user._id));
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        alienSpecies: user.alienSpecies,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        alienSpecies: user.alienSpecies,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastStudiedAt: user.lastStudiedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
