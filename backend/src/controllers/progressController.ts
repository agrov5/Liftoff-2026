import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Progress, { IProgress } from '../models/Progress';
import Lesson from '../models/Lesson';
import User from '../models/User';

// GET /api/progress
export async function getUserProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const progress = await Progress.find({ userId: req.userId })
      .populate('lessonId', 'title elementSymbol lessonOrder xpReward')
      .sort({ updatedAt: -1 });

    const completed = progress.filter((p: IProgress) => p.status === 'completed').length;
    const totalXp = progress.reduce((sum: number, p: IProgress) => sum + p.xpEarned, 0);
    const totalLessons = await Lesson.countDocuments();
    const percentComplete = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    res.json({
      data: {
        lessons: progress,
        summary: { completed, totalXp, totalLessons, percentComplete },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

// POST /api/progress/:elementSymbol/start
export async function startLesson(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, lessonId: lesson._id },
      {
        $setOnInsert: {
          userId: req.userId,
          lessonId: lesson._id,
          elementSymbol: elementSymbol.toUpperCase(),
        },
        $set: { status: 'in_progress' },
      },
      { upsert: true, new: true }
    );

    res.json({ data: progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start lesson' });
  }
}

// POST /api/progress/:elementSymbol/complete
export async function completeLesson(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const existingProgress = await Progress.findOne({ userId: req.userId, lessonId: lesson._id });
    if (existingProgress?.status === 'completed') {
      res.json({ data: existingProgress, message: 'Lesson already completed' });
      return;
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, lessonId: lesson._id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          xpEarned: lesson.xpReward,
        },
      },
      { new: true }
    );

    // Update user XP and streak
    const now = new Date();
    const user = await User.findById(req.userId);
    if (user) {
      user.xp += lesson.xpReward;
      user.level = Math.floor(user.xp / 500) + 1;

      const lastStudied = user.lastStudiedAt;
      const oneDayMs = 86400000;
      if (!lastStudied || now.getTime() - lastStudied.getTime() > oneDayMs * 2) {
        user.streak = 1;
      } else if (now.getTime() - lastStudied.getTime() > oneDayMs) {
        user.streak += 1;
      }
      user.lastStudiedAt = now;
      await user.save();
    }

    res.json({
      data: progress,
      xpEarned: lesson.xpReward,
      newStreak: user?.streak ?? 0,
      newLevel: user?.level ?? 1,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
}

// GET /api/progress/streak
export async function getStreak(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId).select('streak lastStudiedAt xp level');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      data: {
        streak: user.streak,
        lastStudiedAt: user.lastStudiedAt,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
}
