import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforastrologercrm123', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (Astrologer or Admin)
 * @route   POST /api/auth/register
 * @access  Public (Can be restricted later, but helpful for testing)
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specializations, experienceYears, hourlyRate, bio } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'astrologer',
    });

    let astrologerProfile = null;
    if (user.role === 'astrologer') {
      astrologerProfile = await Astrologer.create({
        user: user._id,
        phone: phone || '',
        specializations: specializations || ['Vedic'],
        experienceYears: experienceYears || 0,
        hourlyRate: hourlyRate || 0,
        bio: bio || '',
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile: astrologerProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Get astrologer profile if role is astrologer
    let profile = null;
    if (user.role === 'astrologer') {
      profile = await Astrologer.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;
    
    if (user.role === 'astrologer') {
      profile = await Astrologer.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Astrologer Profile
 * @route   PUT /api/auth/profile
 * @access  Private (Astrologer Only)
 */
export const updateAstroProfile = async (req, res, next) => {
  try {
    const { name, phone, specializations, experienceYears, hourlyRate, bio, availability } = req.body;

    // Update User model fields (like name)
    const user = await User.findById(req.user.id);
    if (name) {
      user.name = name;
      await user.save();
    }

    // Find and update Astrologer profile
    let profile = await Astrologer.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Astrologer({ user: req.user.id });
    }

    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.specializations = specializations !== undefined ? specializations : profile.specializations;
    profile.experienceYears = experienceYears !== undefined ? Number(experienceYears) : profile.experienceYears;
    profile.hourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : profile.hourlyRate;
    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.availability = availability !== undefined ? availability : profile.availability;

    const updatedProfile = await profile.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address' });
    }

    // In a real system, send email with reset token. Here, simulate success.
    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your registered email address (simulated).',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all astrologers list (with profile details)
 * @route   GET /api/auth/astrologers
 * @access  Private (Admin Only)
 */
export const getAllAstrologers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'astrologer' });
    
    const astrologersList = [];
    for (const user of users) {
      const profile = await Astrologer.findOne({ user: user._id });
      astrologersList.push({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        profile,
      });
    }

    res.status(200).json({
      success: true,
      count: astrologersList.length,
      data: astrologersList,
    });
  } catch (error) {
    next(error);
  }
};

