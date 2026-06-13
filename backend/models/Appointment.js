import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
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
      type: Date, // Date portion only (YYYY-MM-DD)
      required: true,
    },
    time: {
      type: String, // HH:MM format
      required: true,
    },
    duration: {
      type: Number, // duration in minutes
      default: 30,
    },
    status: {
      type: String,
      enum: ['scheduled', 'rescheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'chat', 'in-person'],
      default: 'video',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for date to facilitate schedule list querying
appointmentSchema.index({ date: 1, time: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
