import mongoose from 'mongoose';

const astrologerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specializations: {
      type: [String],
      default: ['Vedic'],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    availability: {
      type: String,
      default: 'Monday - Friday (9:00 AM - 6:00 PM)',
    },
  },
  {
    timestamps: true,
  }
);

const Astrologer = mongoose.model('Astrologer', astrologerSchema);
export default Astrologer;
