import Consultation from '../models/Consultation.js';
import Client from '../models/Client.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import * as aiService from '../utils/aiService.js';

/**
 * @desc    Get all consultations (optional filtering by client)
 * @route   GET /api/consultations
 * @access  Private
 */
export const getConsultations = async (req, res, next) => {
  try {
    const { clientId } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    if (clientId) {
      query.client = clientId;
    }

    const consultations = await Consultation.find(query)
      .populate('client', 'name email mobileNumber dateOfBirth placeOfBirth timeOfBirth')
      .populate('astrologer', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get consultation by ID
 * @route   GET /api/consultations/:id
 * @access  Private
 */
export const getConsultationById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    const consultation = await Consultation.findOne(query)
      .populate('client', 'name email mobileNumber dateOfBirth timeOfBirth placeOfBirth gender')
      .populate('astrologer', 'name');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation record not found' });
    }

    res.status(200).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a consultation record (and optional payment / mark appointment complete)
 * @route   POST /api/consultations
 * @access  Private
 */
export const createConsultation = async (req, res, next) => {
  try {
    const {
      appointmentId,
      clientId,
      notes,
      predictions,
      remediesSuggested,
      followUpDate,
      type,
      paymentAmount,
      paymentMethod,
      aiSummary,
      aiFollowUpNotes,
      aiClientInsights,
    } = req.body;

    if (!clientId || !notes) {
      return res.status(400).json({ success: false, message: 'Please provide client ID and consultation notes' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Determine type (from appointment or body)
    let consultationType = type || 'video';
    let appointmentPrice = paymentAmount || 0;

    // Handle optional appointment linkage
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.status = 'completed';
        await appointment.save();
        consultationType = appointment.type;
        if (!paymentAmount) {
          appointmentPrice = appointment.price;
        }
      }
    }

    // Create consultation
    const consultation = await Consultation.create({
      appointment: appointmentId || null,
      client: clientId,
      astrologer: req.user.id,
      date: new Date(),
      type: consultationType,
      notes,
      predictions,
      remediesSuggested,
      followUpDate,
      aiSummary,
      aiFollowUpNotes,
      aiClientInsights,
    });

    // Link consultation ID to client history
    client.consultationHistory.push(consultation._id);
    await client.save();

    // Create payment entry if price > 0 or manual amount is given
    if (appointmentPrice > 0) {
      await Payment.create({
        client: clientId,
        appointment: appointmentId || null,
        consultation: consultation._id,
        amount: appointmentPrice,
        paymentDate: new Date(),
        paymentMethod: paymentMethod || 'upi',
        status: 'completed',
        transactionId: 'TXN' + Math.floor(100000 + Math.random() * 900000),
      });
    }

    // Schedule follow-up alert notification if followUpDate exists
    if (followUpDate) {
      await Notification.create({
        recipient: req.user.id,
        title: 'Follow-up Scheduled',
        message: `Follow-up consultation with ${client.name} set for ${new Date(followUpDate).toLocaleDateString()}.`,
        type: 'follow_up',
      });
    }

    res.status(201).json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger AI consultation summary generation
 * @route   POST /api/consultations/ai/summary
 * @access  Private
 */
export const getAISummary = async (req, res, next) => {
  try {
    const { clientId, notes, predictions } = req.body;
    
    if (!clientId || !notes) {
      return res.status(400).json({ success: false, message: 'Please provide clientId and consultation notes' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const summary = await aiService.generateConsultationSummary(client, notes, predictions || '');
    
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger AI follow-up notes generation
 * @route   POST /api/consultations/ai/followup
 * @access  Private
 */
export const getAIFollowUpNotes = async (req, res, next) => {
  try {
    const { clientId, remedies, followUpDate } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Please provide clientId' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const followUp = await aiService.generateFollowUpNotes(client, remedies || '', followUpDate || null);

    res.status(200).json({
      success: true,
      data: followUp,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger AI client insights generation
 * @route   POST /api/consultations/ai/insights
 * @access  Private
 */
export const getAIClientInsights = async (req, res, next) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Please provide clientId' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Retrieve previous consultations
    const consultations = await Consultation.find({ client: clientId }).sort({ date: -1 }).limit(5);

    const insights = await aiService.generateClientInsights(client, consultations);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};
