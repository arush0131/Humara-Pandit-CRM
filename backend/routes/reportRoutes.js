import express from 'express';
import {
  getClientReport,
  getAppointmentReport,
  exportCSVReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/clients', getClientReport);
router.get('/appointments', getAppointmentReport);
router.get('/export/:type', exportCSVReport); // type: clients, payments, appointments

export default router;
