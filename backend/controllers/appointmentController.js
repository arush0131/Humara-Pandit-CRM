import Appointment from '../models/Appointment.js';
import Client from '../models/Client.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all appointments (optional filtering by date/status)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      const client = await Client.findOne({ userId: req.user.id });
      if (client) {
        query.client = client._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    } else if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      // Expect YYYY-MM-DD
      const targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
      query.date = targetDate;
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'name email mobileNumber placeOfBirth dateOfBirth timeOfBirth')
      .populate('astrologer', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create an appointment
 * @route   POST /api/appointments
 * @access  Private
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { clientId, date, time, duration, type, price, notes } = req.body;
    let targetClientId = clientId;
    let targetAstrologerId = req.body.astrologerId;

    if (req.user.role === 'customer') {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(404).json({ success: false, message: 'Customer profile not found' });
      }
      if (!client.addedBy) {
        return res.status(400).json({ success: false, message: 'Please select an astrologer from the directory before booking.' });
      }
      targetClientId = client._id;
      targetAstrologerId = client.addedBy;
    } else {
      if (!targetClientId) {
        return res.status(400).json({ success: false, message: 'Please provide clientId' });
      }
      if (req.user.role !== 'admin') {
        targetAstrologerId = req.user.id;
      } else if (!targetAstrologerId) {
        return res.status(400).json({ success: false, message: 'Please provide astrologerId' });
      }
    }

    const client = await Client.findById(targetClientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const astrologerId = targetAstrologerId;

    // Convert date string to Date Object (YYYY-MM-DD format safe parsing)
    const apptDate = new Date(date);
    apptDate.setUTCHours(0, 0, 0, 0);

    const appointment = await Appointment.create({
      client: targetClientId,
      astrologer: astrologerId,
      date: apptDate,
      time,
      duration: duration || 30,
      type: type || 'video',
      price: price || 0,
      notes,
    });

    // Create a dashboard notification for the astrologer
    await Notification.create({
      recipient: astrologerId,
      title: 'New Appointment Booked',
      message: `New ${type} consultation scheduled with ${client.name} on ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'appointment',
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an appointment (Reschedule, Cancel, Complete)
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'customer') {
      const client = await Client.findOne({ userId: req.user.id });
      if (client) {
        query.client = client._id;
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
      }
    } else if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    let appointment = await Appointment.findOne(query).populate('client', 'name');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const { date, time, duration, status, type, price, notes } = req.body;

    const oldStatus = appointment.status;

    if (date !== undefined) {
      const apptDate = new Date(date);
      apptDate.setUTCHours(0, 0, 0, 0);
      appointment.date = apptDate;
    }
    if (time !== undefined) appointment.time = time;
    if (duration !== undefined) appointment.duration = Number(duration);
    if (status !== undefined) {
      // Customers can only cancel appointments
      if (req.user.role === 'customer' && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Customers are only permitted to cancel consultations.' });
      }
      appointment.status = status;
    }
    if (type !== undefined) appointment.type = type;
    if (req.user.role !== 'customer') {
      if (price !== undefined) appointment.price = Number(price);
    }
    if (notes !== undefined) appointment.notes = notes;

    const updatedAppointment = await appointment.save();

    // Trigger notification alert if rescheduled or cancelled
    if (status && status !== oldStatus) {
      let titleMsg = 'Appointment Update';
      let bodyMsg = `Appointment status for ${appointment.client.name} updated to ${status}.`;

      if (status === 'rescheduled') {
        titleMsg = 'Appointment Rescheduled';
        bodyMsg = `Appointment with ${appointment.client.name} has been rescheduled to ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`;
      } else if (status === 'cancelled') {
        titleMsg = 'Appointment Cancelled';
        bodyMsg = `Appointment with ${appointment.client.name} has been cancelled.`;
      }

      await Notification.create({
        recipient: appointment.astrologer,
        title: titleMsg,
        message: bodyMsg,
        type: 'appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'customer') {
      const client = await Client.findOne({ userId: req.user.id });
      if (client) {
        query.client = client._id;
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
      }
    } else if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    const appointment = await Appointment.findOneAndDelete(query);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
