import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateAstroProfile,
  forgotPassword,
  getAllAstrologers,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, authorize('astrologer', 'admin'), updateAstroProfile);

// Admin-only Astrologer management routes
router.route('/astrologers')
  .get(protect, authorize('admin'), getAllAstrologers)
  .post(protect, authorize('admin'), registerUser);

export default router;
