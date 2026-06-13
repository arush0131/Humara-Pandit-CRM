import express from 'express';
import {
  getConsultations,
  getConsultationById,
  createConsultation,
  getAISummary,
  getAIFollowUpNotes,
  getAIClientInsights,
} from '../controllers/consultationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConsultations)
  .post(createConsultation);

router.route('/:id')
  .get(getConsultationById);

// AI Assistance routes
router.post('/ai/summary', getAISummary);
router.post('/ai/followup', getAIFollowUpNotes);
router.post('/ai/insights', getAIClientInsights);

export default router;
