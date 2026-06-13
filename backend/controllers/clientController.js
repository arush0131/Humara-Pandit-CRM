import Client from '../models/Client.js';
import Consultation from '../models/Consultation.js';

// Helper to determine zodiac sign
const getZodiacSign = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Aries';
  const month = d.getMonth() + 1;
  const day = d.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

/**
 * @desc    Get all clients with search, filters, and pagination
 * @route   GET /api/clients
 * @access  Private
 */
export const getClients = async (req, res, next) => {
  try {
    const { search, gender, page = 1, limit = 10 } = req.query;

    const query = {};

    // For astrologers, only show clients they added (unless admin)
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    // Apply filters
    if (gender) {
      query.gender = gender;
    }

    // Apply search query (text search or regex fallback)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { placeOfBirth: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination calculations
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Client.countDocuments(query);
    
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Append Zodiac to each client for listing view convenience
    const clientsWithZodiac = clients.map((c) => {
      const plainObj = c.toObject();
      plainObj.zodiac = getZodiacSign(c.dateOfBirth);
      return plainObj;
    });

    res.status(200).json({
      success: true,
      count: clientsWithZodiac.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: clientsWithZodiac,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get client by ID
 * @route   GET /api/clients/:id
 * @access  Private
 */
export const getClientById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const client = await Client.findOne(query)
      .populate({
        path: 'consultationHistory',
        options: { sort: { date: -1 } },
        populate: { path: 'astrologer', select: 'name email' },
      })
      .populate('notes.addedBy', 'name');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const zodiac = getZodiacSign(client.dateOfBirth);
    const clientData = client.toObject();
    clientData.zodiac = zodiac;

    res.status(200).json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a client
 * @route   POST /api/clients
 * @access  Private
 */
export const createClient = async (req, res, next) => {
  try {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender, mobileNumber, email, address, notes } = req.body;

    const newClient = await Client.create({
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender,
      mobileNumber,
      email,
      address,
      addedBy: req.user.id,
      notes: notes ? [{ text: notes, addedBy: req.user.id }] : [],
    });

    res.status(201).json({
      success: true,
      data: newClient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
export const updateClient = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    let client = await Client.findOne(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const fieldsToUpdate = [
      'name',
      'dateOfBirth',
      'timeOfBirth',
      'placeOfBirth',
      'gender',
      'mobileNumber',
      'email',
      'address',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        client[field] = req.body[field];
      }
    });

    const updatedClient = await client.save();

    res.status(200).json({
      success: true,
      data: updatedClient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete client
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
export const deleteClient = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const client = await Client.findOneAndDelete(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Clean up related consultations, appointments, payments
    await Consultation.deleteMany({ client: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Client and associated consultations deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a note to a client
 * @route   POST /api/clients/:id/notes
 * @access  Private
 */
export const addClientNote = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const client = await Client.findOne(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide note text' });
    }

    client.notes.unshift({
      text,
      addedBy: req.user.id,
    });

    await client.save();

    // Re-query to get populated addedBy
    const updatedClient = await Client.findById(client._id).populate('notes.addedBy', 'name');

    res.status(200).json({
      success: true,
      data: updatedClient.notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note from a client
 * @route   DELETE /api/clients/:id/notes/:noteId
 * @access  Private
 */
export const deleteClientNote = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.addedBy = req.user.id;
    }

    const client = await Client.findOne(query);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const { noteId } = req.params;
    
    // Filter out note
    client.notes = client.notes.filter((note) => note._id.toString() !== noteId);
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: client.notes,
    });
  } catch (error) {
    next(error);
  }
};
// Export helpers for internal use
export { getZodiacSign };
