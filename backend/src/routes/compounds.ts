import { Router } from 'express';
import {
  getAllCompounds,
  getCompoundById,
  getCompoundByFormula,
} from '../controllers/compoundController';

const router = Router();

router.get('/', getAllCompounds);
router.get('/formula/:formula', getCompoundByFormula);
router.get('/:id', getCompoundById);

export default router;
