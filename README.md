# Humara Pandit - Astrologer CRM

Humara Pandit is a production-ready, full-stack Astrologer CRM (Customer Relationship Management) portal. It is designed to assist professional astrologers in organizing client records, tracking consultation schedules, viewing detailed timelines, monitoring revenue flow, and generating AI-powered session summaries and client insights.

---

## Tech Stack
* **Frontend**: React 18 (Vite, SPA)
* **Styling**: Tailwind CSS v4 (Glassmorphism & animations)
* **Backend**: Node.js + Express.js (MVC Pattern, ES Modules)
* **Database**: MongoDB (Mongoose, Indexed Search)
* **Authentication**: JSON Web Token (JWT) & bcrypt hashing
* **State Management**: React Context API
* **HTTP Client**: Axios (with custom token renew interceptors)
* **AI Engine**: Google Gemini API integration (with native offline fallback rule engine)

---

## Project Folder Structure
```text
astrologer-crm/
│
├── frontend/               # React Vite client app
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Charts, Skeletons, Toasts)
│   │   ├── context/        # Session AuthContext
│   │   ├── pages/          # Views (Dashboard, Clients, Appointments, etc.)
│   │   └── services/       # Axios API configurations
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # Express REST API server
│   ├── config/             # DB initialization hooks
│   ├── controllers/        # Route business logic handlers
│   ├── middleware/         # Token validation and error catching
│   ├── models/             # Mongoose MongoDB Schemas
│   ├── routes/             # API Router mounts
│   ├── utils/              # Seeding script and AI service engine
│   ├── package.json
│   └── server.js
│
├── AI_USAGE.md             # Generative AI disclosure file
├── README.md               # setup guides and instructions
└── .gitignore              # git rules config
```

---

## Quick Setup Instructions

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **MongoDB** (Local instance running on `mongodb://localhost:27017` or Atlas URI)

---

### Step 1: Clone and Configure Environment Variables

Create a `.env` file in the `backend/` directory:
```bash
cd backend
touch .env
```

Add the following environment variables:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/astrologer-crm
JWT_SECRET=supersecretjwtkeyforastrologercrm123
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> If `GEMINI_API_KEY` is left empty, the application will automatically activate the **Astrological Rule Engine Fallback**, generating high-fidelity simulated summaries, insights, and reminders.

---

### Step 2: Set Up & Seed Backend Server

Install dependencies and run the seed script to populate the database with sample astrologers, clients, and transaction histories:
```bash
# In the backend directory
npm install
npm run seed
```

Start the Express development server:
```bash
npm run dev
# or
npm start
```
The REST API will launch at `http://localhost:5001`.

---

### Step 3: Set Up & Launch Frontend Client

Open a new terminal tab, navigate to the `frontend/` directory, install packages, and boot the development server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Sample Credentials for Development

| Email Address | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **admin@astrocrm.com** | admin123 | Admin | Full dashboard control |
| **pandit.sharma@astrocrm.com** | pandit123 | Astrologer | Pandit Ramesh Sharma |
| **ananya.sen@astrocrm.com** | ananya123 | Astrologer | Dr. Ananya Sen |

---

## Key Features Checklist
1. **Authentication Module**: Secure login, password recovery simulations, and Protected Route wrapper checks.
2. **Interactive Dashboard**: Total client trackers, earnings progression, dynamic SVG charts, and scheduling feeds.
3. **Client Directory**: CRUD pages, text-indexed profiles search, date-of-birth zodiac computes, and timelines.
4. **Consultations Worksheet**: Astro predictions and remedies inputs, completed status triggers, and AI summaries.
5. **Ledger Transactions**: Automatic transaction receipts, payment methods trackers, and manual earnings loggers.
6. **Analytical Reports**: Client demographics, scheduling densities, and single-click CSV data exports.
7. **Dashboard Notifications**: Bell icon alerts for bookings updates and follow-up reminders.
