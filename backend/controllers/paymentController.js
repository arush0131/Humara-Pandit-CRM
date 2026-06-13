import Payment from '../models/Payment.js';
import Client from '../models/Client.js';

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private
 */
export const getPayments = async (req, res, next) => {
  try {
    const query = {};

    // For astrologers, first retrieve IDs of clients they created, and filter payments
    if (req.user.role !== 'admin') {
      const clientIds = await Client.find({ addedBy: req.user.id }).select('_id');
      query.client = { $in: clientIds.map(c => c._id) };
    }

    const payments = await Payment.find(query)
      .populate('client', 'name email mobileNumber')
      .populate('appointment', 'date time type')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create manual payment record
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = async (req, res, next) => {
  try {
    const { clientId, amount, paymentMethod, status, transactionId } = req.body;

    if (!clientId || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide client ID and payment amount' });
    }

    // Verify client exists and astrologer owns them
    const query = { _id: clientId };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const client = await Client.findOne(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const payment = await Payment.create({
      client: clientId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'upi',
      status: status || 'completed',
      transactionId: transactionId || 'TXN' + Math.floor(100000 + Math.random() * 900000),
      paymentDate: new Date(),
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics and charts aggregate data
 * @route   GET /api/payments/dashboard/metrics
 * @access  Private
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const query = {};

    // Scope queries to astrologer's own records if not admin
    if (req.user.role !== 'admin') {
      const clientIds = await Client.find({ addedBy: req.user.id }).select('_id');
      query.client = { $in: clientIds.map(c => c._id) };
    }

    // 1. Total Lifetime Revenue
    const payments = await Payment.find({ ...query, status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Monthly Revenue (Last 6 Months)
    const monthlyRevenue = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

      const monthPayments = payments.filter((p) => {
        const pDate = new Date(p.paymentDate);
        return pDate >= start && pDate <= end;
      });

      const amount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const monthLabel = targetMonth.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      monthlyRevenue.push({
        month: monthLabel,
        revenue: amount,
      });
    }

    // 3. Payment Method Distribution
    const methods = { upi: 0, cash: 0, card: 0, bank_transfer: 0, other: 0 };
    payments.forEach((p) => {
      if (methods[p.paymentMethod] !== undefined) {
        methods[p.paymentMethod] += p.amount;
      } else {
        methods.other += p.amount;
      }
    });

    const methodDistribution = Object.keys(methods).map((key) => ({
      method: key.toUpperCase().replace('_', ' '),
      value: methods[key],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        methodDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
