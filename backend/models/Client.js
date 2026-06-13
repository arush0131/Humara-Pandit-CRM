import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide client date of birth'],
    },
    timeOfBirth: {
      type: String, // format HH:MM
      required: [true, 'Please provide client time of birth'],
    },
    placeOfBirth: {
      type: String,
      required: [true, 'Please provide client place of birth'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Please provide client gender'],
      enum: ['male', 'female', 'other'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please provide client mobile number'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    consultationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for searching name, mobileNumber, email, or place of birth
clientSchema.index({ name: 'text', mobileNumber: 'text', email: 'text', placeOfBirth: 'text' });

const Client = mongoose.model('Client', clientSchema);
export default Client;
