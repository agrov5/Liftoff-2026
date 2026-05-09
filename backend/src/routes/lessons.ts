import { Router } from 'express';
import {
  getAllLessons,
  getLessonByElement,
  getLessonVocabulary,
  getLessonQuiz,
  getLessonEarthExamples,
} from '../controllers/lessonController';

const router = Router();

router.get('/', getAllLessons);
router.get('/:elementSymbol', getLessonByElement);
router.get('/:elementSymbol/vocabulary', getLessonVocabulary);
router.get('/:elementSymbol/quiz', getLessonQuiz);
router.get('/:elementSymbol/earth-examples', getLessonEarthExamples);

export default router;
