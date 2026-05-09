import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Lesson from '../models/Lesson';
import Progress from '../models/Progress';

// POST /api/interactive/:elementSymbol/quiz/submit
export async function submitQuiz(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const { answers } = req.body as { answers: { questionId: string; answer: string }[] };

    if (!Array.isArray(answers)) {
      res.status(400).json({ error: 'answers must be an array' });
      return;
    }

    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() });
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Grade answers
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers: { questionId: string; answer: string; correct: boolean; correctAnswer: string; explanation: string }[] = [];

    for (const question of lesson.quizQuestions) {
      const qId = String(question._id);
      totalPoints += question.points;
      const submitted = answers.find((a) => a.questionId === qId);
      const isCorrect = submitted?.answer === question.correctAnswer;
      if (isCorrect) score += question.points;
      gradedAnswers.push({
        questionId: qId,
        answer: submitted?.answer ?? '',
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    // Save attempt to progress
    if (req.userId) {
      const progressEntry = await Progress.findOne({ userId: req.userId, lessonId: lesson._id });
      if (progressEntry) {
        progressEntry.quizAttempts.push({
          attemptedAt: new Date(),
          score,
          totalPoints,
          answers: gradedAnswers.map((a) => ({
            questionId: a.questionId,
            answer: a.answer,
            correct: a.correct,
          })),
        });
        progressEntry.bestScore = Math.max(progressEntry.bestScore, score);
        await progressEntry.save();
      }
    }

    res.json({
      data: {
        score,
        totalPoints,
        percentage,
        passed: percentage >= 70,
        answers: gradedAnswers,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
}

// GET /api/interactive/:elementSymbol/bohr
export async function getBohrInteractive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() })
      .populate('elementRef', 'symbol name atomicNumber protons neutrons electrons bohrShells category');

    if (!lesson || !lesson.elementRef) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = lesson.elementRef as any;
    res.json({
      data: {
        element: {
          symbol: el.symbol,
          name: el.name,
          atomicNumber: el.atomicNumber,
          category: el.category,
        },
        nucleus: { protons: el.protons, neutrons: el.neutrons },
        shells: el.bohrShells,
        totalElectrons: el.electrons,
        interactive: {
          description: `Build the Bohr-Rutherford model for ${el.name as string}!`,
          hint: `${el.name as string} has ${el.protons as number} proton(s) and ${el.electrons as number} electron(s) arranged in ${(el.bohrShells as unknown[]).length} shell(s).`,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Bohr interactive data' });
  }
}

// GET /api/interactive/leaderboard
export async function getLeaderboard(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const User = (await import('../models/User')).default;
    const leaders = await User.find()
      .select('username alienSpecies xp level streak avatarUrl')
      .sort({ xp: -1 })
      .limit(20);

    res.json({ data: leaders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
