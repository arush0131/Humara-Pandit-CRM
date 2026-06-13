import express from 'express';
import {
  getPayments,
  createPayment,
  getDashboardMetrics,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.get('/dashboard/metrics', getDashboardMetrics);

export default router;
