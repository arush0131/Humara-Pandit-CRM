import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import Client from '../models/Client.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

import { generateConsultationSummary, generateFollowUpNotes, generateClientInsights } from './aiService.js';

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/astrologer-crm';
    console.log(`Connecting to MongoDB for seeding at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Astrologer.deleteMany();
    await Client.deleteMany();
    await Appointment.deleteMany();
    await Consultation.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    console.log('Seeding Users...');
    
    // 1. Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@astrocrm.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    const astroUser1 = await User.create({
      name: 'Pandit Ramesh Sharma',
      email: 'pandit.sharma@astrocrm.com',
      password: 'pandit123',
      role: 'astrologer',
      status: 'active',
    });

    const astroUser2 = await User.create({
      name: 'Dr. Ananya Sen',
      email: 'ananya.sen@astrocrm.com',
      password: 'ananya123',
      role: 'astrologer',
      status: 'active',
    });

    console.log('Seeding Astrologers profiles...');
    // 2. Create Astrologer Profiles
    await Astrologer.create({
      user: astroUser1._id,
      phone: '+919876543210',
      specializations: ['Vedic', 'Vastu Shastra', 'Muhurat'],
      experienceYears: 15,
      hourlyRate: 100,
      bio: 'Renowned expert in Kundali matching, Vastu planning, and remedial Vedic rituals.',
      rating: 4.9,
      availability: 'Mon - Sat (10:00 AM - 5:00 PM)',
    });

    await Astrologer.create({
      user: astroUser2._id,
      phone: '+918765432109',
      specializations: ['Western Astrology', 'Numerology', 'Palmistry'],
      experienceYears: 10,
      hourlyRate: 85,
      bio: 'Specialist in Western transit analysis, career alignment counselling, and numerology name changes.',
      rating: 4.7,
      availability: 'Mon - Fri (11:00 AM - 7:00 PM)',
    });

    console.log('Seeding Clients...');
    // 3. Create Clients
    const clientsData = [
      {
        name: 'Rohan Mehta',
        dateOfBirth: new Date('1992-05-15T00:00:00'),
        timeOfBirth: '08:45',
        placeOfBirth: 'Mumbai, India',
        gender: 'male',
        mobileNumber: '9988776655',
        email: 'rohan.mehta@gmail.com',
        address: 'Flat 402, Sea Breeze Apts, Bandra, Mumbai',
        addedBy: astroUser1._id,
        notes: [
          { text: 'Client concerned about career switch and job stability in the tech sector.', addedBy: astroUser1._id }
        ]
      },
      {
        name: 'Priya Iyer',
        dateOfBirth: new Date('1988-11-23T00:00:00'),
        timeOfBirth: '14:22',
        placeOfBirth: 'Chennai, India',
        gender: 'female',
        mobileNumber: '9876123450',
        email: 'priya.iyer@yahoo.com',
        address: 'Adyar Green Gardens, Block C, Chennai',
        addedBy: astroUser1._id,
        notes: [
          { text: 'Anxious regarding marriage delay and partner compatibility matching.', addedBy: astroUser1._id }
        ]
      },
      {
        name: 'Amit Patel',
        dateOfBirth: new Date('1985-02-04T00:00:00'),
        timeOfBirth: '23:10',
        placeOfBirth: 'Ahmedabad, India',
        gender: 'male',
        mobileNumber: '9123456780',
        email: 'amit.patel@gmail.com',
        address: '32 Shanti Kunj Society, Satellite, Ahmedabad',
        addedBy: astroUser2._id,
        notes: [
          { text: 'Starting a new chemical trading business, seeking business name vibration analysis.', addedBy: astroUser2._id }
        ]
      },
      {
        name: 'Sanjana Sen',
        dateOfBirth: new Date('1995-09-08T00:00:00'),
        timeOfBirth: '18:30',
        placeOfBirth: 'Kolkata, India',
        gender: 'female',
        mobileNumber: '9008007006',
        email: 'sanjana.sen@outlook.com',
        address: '15/A Salt Lake, Sector 2, Kolkata',
        addedBy: astroUser2._id,
        notes: [
          { text: 'Health concerns related to stress and digestion, looking for gemstone recommendation.', addedBy: astroUser2._id }
        ]
      }
    ];

    const seededClients = await Client.create(clientsData);

    console.log('Seeding Appointments, Consultations & Payments...');
    
    // Past dates for historical calculations
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
    
    // Future dates for upcoming schedules
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

    // List of appointments to generate
    const appts = [
      // Client 1 (Rohan) with Astro 1 (Sharma) - Completed (2 months ago)
      {
        client: seededClients[0]._id,
        astrologer: astroUser1._id,
        date: twoMonthsAgo,
        time: '10:00',
        duration: 30,
        status: 'completed',
        type: 'video',
        price: 150,
        notes: 'Discussed career switch. Chart indicates good prospects after Saturn transit.'
      },
      // Client 1 (Rohan) with Astro 1 (Sharma) - Completed (1 month ago)
      {
        client: seededClients[0]._id,
        astrologer: astroUser1._id,
        date: oneMonthAgo,
        time: '10:30',
        duration: 30,
        status: 'completed',
        type: 'video',
        price: 150,
        notes: 'Follow up on resume adjustments and auspicious dates for applying.'
      },
      // Client 1 (Rohan) with Astro 1 (Sharma) - Scheduled (tomorrow)
      {
        client: seededClients[0]._id,
        astrologer: astroUser1._id,
        date: tomorrow,
        time: '09:30',
        duration: 30,
        status: 'scheduled',
        type: 'video',
        price: 150,
        notes: 'Reviewing job offer letters received.'
      },
      // Client 2 (Priya) with Astro 1 (Sharma) - Completed (1 month ago)
      {
        client: seededClients[1]._id,
        astrologer: astroUser1._id,
        date: oneMonthAgo,
        time: '11:30',
        duration: 45,
        status: 'completed',
        type: 'audio',
        price: 200,
        notes: 'Detailed Kundali matchmaking for prospective partner.'
      },
      // Client 2 (Priya) with Astro 1 (Sharma) - Scheduled (in 3 days)
      {
        client: seededClients[1]._id,
        astrologer: astroUser1._id,
        date: inThreeDays,
        time: '14:00',
        duration: 30,
        status: 'scheduled',
        type: 'chat',
        price: 100,
        notes: 'Discussing puja remedial dates.'
      },
      // Client 3 (Amit) with Astro 2 (Ananya) - Completed (1 month ago)
      {
        client: seededClients[2]._id,
        astrologer: astroUser2._id,
        date: oneMonthAgo,
        time: '15:00',
        duration: 60,
        status: 'completed',
        type: 'in-person',
        price: 250,
        notes: 'Numerological analysis for trademark registration and partners names.'
      },
      // Client 4 (Sanjana) with Astro 2 (Ananya) - Cancelled
      {
        client: seededClients[3]._id,
        astrologer: astroUser2._id,
        date: oneMonthAgo,
        time: '16:30',
        duration: 30,
        status: 'cancelled',
        type: 'video',
        price: 120,
        notes: 'Client had emergency meetings.'
      }
    ];

    const seededAppts = await Appointment.create(appts);

    // Generate consultations and payments for the completed appointments
    for (const appt of seededAppts) {
      if (appt.status === 'completed') {
        const client = seededClients.find(c => c._id.toString() === appt.client.toString());
        
        let notesText = '';
        let predictionsText = '';
        let remediesText = '';
        let followUpDateVal = null;
        
        if (appt.notes.includes('career')) {
          notesText = 'Rohan has been working in software for 5 years and feels stuck. His charts show a heavy influence of Saturn in the 8th house, causing temporary delays in career. However, Jupiter transiting into the 10th house in July will open key growth avenues.';
          predictionsText = 'Expect a highly favorable job offer in mid-August. Transition will be fruitful. Financial status will elevate in Q4.';
          remediesText = 'Chant Shani Chalisa on Saturdays. Wear a 5-carat Blue Sapphire (Neelam) in silver on the middle finger after proper energization.';
          followUpDateVal = tomorrow;
        } else if (appt.notes.includes('matching')) {
          notesText = 'Kundali matchmaking for Priya and prospect. Compatibility score is 24/36 (favorable). Manglik dosha is mild on the groom\'s side but neutralizes due to Priya\'s Jupiter placement. Health and financial charts show high synergy.';
          predictionsText = 'Marriage alignment is highly prospective for late 2026. Progeny houses show strong benefits.';
          remediesText = 'Both to perform Lord Vishnu puja together. Priya to fast on Thursdays and donate yellow sweets.';
          followUpDateVal = inThreeDays;
        } else {
          notesText = 'Business name analysis for Amit\'s trading firm. Current proposed names score low on harmony index. Suggested modifications to name spelling to align with birth number 4 (Rahu influence, requiring grounding).';
          predictionsText = 'Adjusted brand name will launch successfully. First 6 months will require strict working capital discipline, followed by exponential expansion.';
          remediesText = 'Brand name spelling adjusted to total 24 (Venkateshwara alignment). Keep a copper pyramid in the North-East corner of the corporate office.';
          followUpDateVal = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
        }

        // Generate AI details using service
        const aiSummaryText = await generateConsultationSummary(client, notesText, predictionsText);
        const aiFollowUpText = await generateFollowUpNotes(client, remediesText, followUpDateVal);
        const aiInsightsText = await generateClientInsights(client, [{ notes: notesText }]);

        const consultation = await Consultation.create({
          appointment: appt._id,
          client: appt.client,
          astrologer: appt.astrologer,
          date: appt.date,
          type: appt.type,
          notes: notesText,
          predictions: predictionsText,
          remediesSuggested: remediesText,
          followUpDate: followUpDateVal,
          aiSummary: aiSummaryText,
          aiFollowUpNotes: aiFollowUpText,
          aiClientInsights: aiInsightsText
        });

        // Update client's consultation history
        await Client.findByIdAndUpdate(appt.client, {
          $push: { consultationHistory: consultation._id }
        });

        // Create Payment
        await Payment.create({
          client: appt.client,
          appointment: appt._id,
          consultation: consultation._id,
          amount: appt.price,
          paymentDate: appt.date,
          paymentMethod: appt.type === 'in-person' ? 'cash' : 'upi',
          status: 'completed',
          transactionId: 'TXN' + Math.floor(100000 + Math.random() * 900000)
        });
      }
    }

    // Seeding some notifications
    console.log('Seeding Notifications...');
    await Notification.create([
      {
        recipient: astroUser1._id,
        title: 'Upcoming Appointment',
        message: `You have a video consultation with Rohan Mehta tomorrow at 09:30 AM.`,
        type: 'appointment',
        read: false
      },
      {
        recipient: astroUser1._id,
        title: 'Follow-up Alert',
        message: `Priya Iyer is due for a follow-up consultation in 3 days.`,
        type: 'follow_up',
        read: false
      },
      {
        recipient: astroUser2._id,
        title: 'System Notification',
        message: 'Welcome to your Astrologer CRM portal. Keep track of your client schedules and AI charts seamlessly.',
        type: 'alert',
        read: true
      }
    ]);

    console.log('Database Seeding Completed Successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
