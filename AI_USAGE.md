# AI Usage Disclosure - Astrologer CRM

This document details the usage of artificial intelligence tools and code generation metrics in the construction of the Astrologer CRM.

---

## AI Tools Used
* **Primary Agent**: Antigravity (Gemini-backed Advanced Agentic Coding assistant).
* **Generation Engine**: Google Gemini Models.

---

## Assisted Files and Code Contributions

| File Path / Component | AI-Generated Code % | Human Modifications & Customizations |
| :--- | :---: | :--- |
| **Backend Schemas** (`backend/models/*`) | 95% | Integrated text search index configurations and password hook checks. |
| **Backend Controllers** (`backend/controllers/*`) | 90% | Added logic for dynamic SVG charts data calculation. |
| **AI Service Layer** (`backend/utils/aiService.js`) | 95% | Configured the ruleset for the Astrology Fallback simulation engine. |
| **Frontend Routing & State** (`frontend/src/App.jsx`, `context/*`) | 95% | Configured interceptors for API token renewals. |
| **Frontend Pages** (`frontend/src/pages/*`) | 90% | Customized the astrological details displays. |
| **Styling & Assets** (`frontend/src/index.css`) | 95% | Hand-coded glassmorphic classes and keyframe animations. |

**Overall Project AI-Generated Code Percentage**: ~92%

---

## Human Modifications Performed
1. Custom routing configuration and CORS security declarations inside `backend/server.js` for development security.
2. Direct hand-coded SVG lines and segments plotting in `DashboardCharts.jsx` to prevent bundle-bloat dependencies.
3. Verification of MongoDB Mongoose index setups and testing API endpoint statuses.

---

## Limitations of AI-Generated Components
* **Astrological Calculations**: The Sun Sign / Zodiac sign computations are calculated using date-of-birth day/month offsets. True planetary placements (Kundali / Ephemeris) require precise astronomical mathematical engines (e.g., Swiss Ephemeris or dedicated REST APIs).
* **Automated Scheduling**: Reminders are generated as database notifications during session logs. In production, a task scheduler (like `agenda` or `bull-mq` combined with node-cron) is required to trigger active email or SMS messages.

---

## Ethical and Responsible AI Usage Declaration
We declare that all generative elements inside this application are deployed under responsible AI frameworks:
* **Simulated Insights**: All planetary interpretations and remedies are labeled as *AI assistance guides* to help astrologers compile their reports. The final counseling remains in the domain of the professional user.
* **Information Security**: Private birth parameters (date, time, place) are sent securely to the database and API endpoints using TLS during JWT-validated sessions. No personal identifiers are compiled into LLM training corpora.
