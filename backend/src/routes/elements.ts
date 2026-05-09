import { Router } from 'express';
import {
  getAllElements,
  getElementById,
  getElementBySymbol,
  getBohrModel,
  getElementCompounds,
  getCategories,
} from '../controllers/elementController';

const router = Router();

router.get('/', getAllElements);
router.get('/categories', getCategories);
router.get('/symbol/:symbol', getElementBySymbol);
router.get('/:atomicNumber', getElementById);
router.get('/:atomicNumber/bohr', getBohrModel);
router.get('/:atomicNumber/compounds', getElementCompounds);

export default router;
