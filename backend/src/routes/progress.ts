import { Router } from 'express';
import {
  getUserProgress,
  startLesson,
  completeLesson,
  getStreak,
} from '../controllers/progressController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getUserProgress);
router.get('/streak', getStreak);
router.post('/:elementSymbol/start', startLesson);
router.post('/:elementSymbol/complete', completeLesson);

export default router;
