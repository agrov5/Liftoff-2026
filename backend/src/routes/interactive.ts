import { Router } from 'express';
import {
  submitQuiz,
  getBohrInteractive,
  getLeaderboard,
} from '../controllers/interactiveController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:elementSymbol/bohr', requireAuth, getBohrInteractive);
router.post('/:elementSymbol/quiz/submit', requireAuth, submitQuiz);

export default router;
