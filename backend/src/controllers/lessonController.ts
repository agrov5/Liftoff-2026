import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import Element from '../models/Element';

// GET /api/lessons
export async function getAllLessons(req: Request, res: Response): Promise<void> {
  try {
    const difficulty = req.query.difficulty as string | undefined;
    const published = req.query.published as string | undefined;
    const filter: Record<string, unknown> = {};
    if (difficulty) filter.difficulty = difficulty;
    if (published !== undefined) filter.isPublished = published === 'true';

    const lessons = await Lesson.find(filter)
      .select('-quizQuestions -vocabulary')
      .populate('elementRef', 'symbol name elementImageUrl category')
      .sort({ lessonOrder: 1 });

    res.json({ data: lessons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
}

// GET /api/lessons/:elementSymbol
export async function getLessonByElement(req: Request, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() })
      .populate('elementRef')
      .populate('compoundRefs');

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found for this element' });
      return;
    }
    res.json({ data: lesson });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
}

// GET /api/lessons/:elementSymbol/vocabulary
export async function getLessonVocabulary(req: Request, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() })
      .select('elementSymbol vocabulary');

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }
    res.json({ data: lesson.vocabulary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
}

// GET /api/lessons/:elementSymbol/quiz
export async function getLessonQuiz(req: Request, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const lesson = await Lesson.findOne({ elementSymbol: elementSymbol.toUpperCase() })
      .select('elementSymbol quizQuestions xpReward');

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Strip correct answers before sending to client
    const sanitizedQuestions = lesson.quizQuestions.map((q) => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
      imageUrl: q.imageUrl,
      points: q.points,
    }));

    res.json({ data: { questions: sanitizedQuestions, xpReward: lesson.xpReward } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}

// GET /api/lessons/:elementSymbol/earth-examples
export async function getLessonEarthExamples(req: Request, res: Response): Promise<void> {
  try {
    const elementSymbol = req.params['elementSymbol'] as string;
    const element = await Element.findOne({ symbol: elementSymbol.toUpperCase() })
      .select('symbol name earthExamples elementImageUrl funFact');

    if (!element) {
      res.status(404).json({ error: 'Element not found' });
      return;
    }
    res.json({
      data: {
        symbol: element.symbol,
        name: element.name,
        funFact: element.funFact,
        elementImageUrl: element.elementImageUrl,
        earthExamples: element.earthExamples,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earth examples' });
  }
}
