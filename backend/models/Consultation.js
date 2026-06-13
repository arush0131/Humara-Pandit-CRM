import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'chat', 'in-person'],
      default: 'video',
    },
    notes: {
      type: String,
      required: [true, 'Please provide consultation notes'],
    },
    predictions: {
      type: String,
      trim: true,
    },
    remediesSuggested: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    aiFollowUpNotes: {
      type: String,
      trim: true,
    },
    aiClientInsights: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
