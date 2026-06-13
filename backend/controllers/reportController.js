import Client from '../models/Client.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import { getZodiacSign } from './clientController.js';

/**
 * @desc    Get client statistics
 * @route   GET /api/reports/clients
 * @access  Private
 */
export const getClientReport = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const clients = await Client.find(query);
    const totalClients = clients.length;

    // 1. Gender distribution
    const genderDist = { male: 0, female: 0, other: 0 };
    clients.forEach((c) => {
      if (genderDist[c.gender] !== undefined) genderDist[c.gender]++;
    });

    // 2. Zodiac Sign distribution
    const zodiacDist = {};
    clients.forEach((c) => {
      const sign = getZodiacSign(c.dateOfBirth);
      zodiacDist[sign] = (zodiacDist[sign] || 0) + 1;
    });

    const zodiacs = Object.keys(zodiacDist).map((key) => ({
      sign: key,
      count: zodiacDist[key],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalClients,
        genderDistribution: [
          { name: 'Male', count: genderDist.male },
          { name: 'Female', count: genderDist.female },
          { name: 'Other', count: genderDist.other },
        ],
        zodiacDistribution: zodiacs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment metrics
 * @route   GET /api/reports/appointments
 * @access  Private
 */
export const getAppointmentReport = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      query.astrologer = req.user.id;
    }

    const appointments = await Appointment.find(query);
    const totalAppointments = appointments.length;

    // 1. Status breakdown
    const statusBreakdown = { scheduled: 0, rescheduled: 0, completed: 0, cancelled: 0 };
    appointments.forEach((a) => {
      if (statusBreakdown[a.status] !== undefined) statusBreakdown[a.status]++;
    });

    // 2. Channel type distribution
    const typeDistribution = { video: 0, audio: 0, chat: 0, 'in-person': 0 };
    appointments.forEach((a) => {
      if (typeDistribution[a.type] !== undefined) typeDistribution[a.type]++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        statusDistribution: Object.keys(statusBreakdown).map((k) => ({ name: k.toUpperCase(), count: statusBreakdown[k] })),
        channelDistribution: Object.keys(typeDistribution).map((k) => ({ name: k.toUpperCase(), count: typeDistribution[k] })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export CSV Report of Clients, Payments, or Appointments
 * @route   GET /api/reports/export/:type
 * @access  Private
 */
export const exportCSVReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    let csvContent = '';
    let filename = '';

    if (type === 'clients') {
      const query = {};
      if (req.user.role !== 'admin') {
        query.addedBy = req.user.id;
      }
      const clients = await Client.find(query);
      
      filename = 'clients_report.csv';
      csvContent = 'Name,Email,Mobile,Gender,DOB,Time of Birth,Place of Birth,Address\n';
      
      clients.forEach((c) => {
        const dob = c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : '';
        const emailStr = c.email || '';
        const addressStr = c.address ? `"${c.address.replace(/"/g, '""')}"` : '';
        csvContent += `${c.name},${emailStr},${c.mobileNumber},${c.gender},${dob},${c.timeOfBirth},${c.placeOfBirth},${addressStr}\n`;
      });
      
    } else if (type === 'payments') {
      const query = {};
      if (req.user.role !== 'admin') {
        const clientIds = await Client.find({ addedBy: req.user.id }).select('_id');
        query.client = { $in: clientIds.map(c => c._id) };
      }
      const payments = await Payment.find(query).populate('client', 'name email');
      
      filename = 'revenue_report.csv';
      csvContent = 'Transaction ID,Client Name,Client Email,Amount,Payment Date,Payment Method,Status\n';
      
      payments.forEach((p) => {
        const dateStr = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '';
        const clientName = p.client ? p.client.name : 'Unknown';
        const clientEmail = p.client ? p.client.email || '' : '';
        csvContent += `${p.transactionId},${clientName},${clientEmail},${p.amount},${dateStr},${p.paymentMethod},${p.status}\n`;
      });
      
    } else if (type === 'appointments') {
      const query = {};
      if (req.user.role !== 'admin') {
        query.astrologer = req.user.id;
      }
      const appointments = await Appointment.find(query).populate('client', 'name');
      
      filename = 'appointments_report.csv';
      csvContent = 'Client Name,Date,Time,Duration (Min),Status,Type,Price,Notes\n';
      
      appointments.forEach((a) => {
        const dateStr = a.date ? new Date(a.date).toLocaleDateString() : '';
        const clientName = a.client ? a.client.name : 'Unknown';
        const notesStr = a.notes ? `"${a.notes.replace(/"/g, '""')}"` : '';
        csvContent += `${clientName},${dateStr},${a.time},${a.duration},${a.status},${a.type},${a.price},${notesStr}\n`;
      });
      
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report export type. Must be clients, payments, or appointments.' });
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
