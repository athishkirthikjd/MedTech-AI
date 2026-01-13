# 🩺 MedTech AI - Intelligent Hospital Operating System

> **AI-powered healthcare platform for symptom checking, appointment booking, and emergency response**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)

---

## 🌟 Overview

MedTech AI is a production-grade, VC-demo-ready healthcare SaaS platform that combines modern web technologies with artificial intelligence to deliver a comprehensive hospital management solution.

### Key Capabilities

- 🤖 **AI Symptom Checker** - Gemini-powered symptom analysis with safety-first approach
- 🎙️ **Voice Chat** - Natural voice interactions for symptom description
- 🚨 **Emergency SOS** - One-tap emergency alerts with location tracking
- 📅 **Smart Scheduling** - Intelligent appointment booking with availability management
- 💊 **Digital Prescriptions** - Paperless prescription management
- 📊 **Health Vitals** - Track BP, heart rate, SpO2, glucose with alerts
- 👥 **Role-Based Access** - Patient, Doctor, and Admin dashboards

---

## 🏗️ Architecture

```
medtech-ai-assistant/
├── src/                    # React Frontend
│   ├── components/         # UI Components (shadcn/ui)
│   ├── pages/             # Route pages
│   ├── contexts/          # Auth & Theme contexts
│   └── hooks/             # Custom React hooks
│
├── backend/               # FastAPI Backend
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   ├── core/          # Config, security, dependencies
│   │   ├── db/            # SQLAlchemy async setup
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   │       └── ai/        # Gemini integration & safety rules
│   └── supabase/          # Database schema
│
└── public/                # Static assets
```

---

## 🛡️ Safety-First AI Design

The AI symptom checker includes **mandatory safety overrides** that cannot be bypassed:

### Emergency Keywords (Immediate SOS)
```
chest pain | heart attack | can't breathe | stroke | seizure
unconscious | severe bleeding | overdose | suicidal
```

These **ALWAYS** trigger `EMERGENCY` risk level regardless of AI analysis.

### Risk Classification
| Level | Action | Examples |
|-------|--------|----------|
| 🟢 Low | Self-care tips | Mild headache, runny nose |
| 🟡 Medium | Book appointment | Persistent cough, fever |
| 🟠 High | Urgent care | High fever, blood in urine |
| 🔴 Emergency | Call 911 / SOS | Chest pain, difficulty breathing |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account
- Google Gemini API key

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations (after setting up Supabase)
# Run supabase/schema.sql in Supabase SQL Editor

# Start server
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` with docs at `/docs`

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | Component Library |
| Framer Motion | Animations |
| React Router v6 | Routing |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | API Framework |
| SQLAlchemy 2.0 | Async ORM |
| Pydantic v2 | Validation |
| Supabase | Auth & Database |
| Google Gemini | AI/LLM |
| python-jose | JWT Handling |

---

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/verify     - Verify JWT token
GET  /api/v1/auth/me         - Get current user
POST /api/v1/auth/register   - Register new user
```

### AI Services
```
POST /api/v1/ai/symptom-check  - AI symptom analysis
POST /api/v1/ai/voice-chat     - Voice interaction
POST /api/v1/ai/chat           - General health chat
```

### Core Features
```
POST /api/v1/appointments           - Book appointment
GET  /api/v1/appointments           - List appointments
POST /api/v1/vitals                 - Record health vitals
GET  /api/v1/vitals/history         - Get vitals history
POST /api/v1/emergency/trigger      - Trigger SOS
GET  /api/v1/doctors                - List doctors
```

---

## 🎨 Features by Role

### 👤 Patient Dashboard
- AI symptom checker with voice input
- Book video/in-person consultations
- Track health vitals with charts
- Digital prescriptions
- Emergency SOS button
- Chat with AI assistant

### 👨‍⚕️ Doctor Dashboard
- View patient appointments
- Write digital prescriptions
- Access patient health records
- Manage availability schedule
- Respond to emergencies

### 🔐 Admin Dashboard
- User management
- System analytics
- Emergency monitoring
- Platform configuration

---

## 🔒 Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET={"kty":"EC",...}

# Database
DATABASE_URL=postgresql+asyncpg://...

# AI
GEMINI_API_KEY=your-gemini-api-key

# Security
JWT_ALGORITHM=ES256
```

---

## 📱 Screenshots

| Landing Page | Patient Dashboard | AI Chat |
|--------------|-------------------|---------|
| Modern hero section | Health vitals overview | Voice-enabled symptom checker |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend (coming soon)
npm run test
```

---

## 📄 License

Private - All rights reserved.

---

## 👥 Team

Built with ❤️ for the healthcare industry.

---

<p align="center">
  <b>MedTech AI</b> - Making healthcare accessible through AI
</p>
