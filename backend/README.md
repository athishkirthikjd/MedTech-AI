# MedTech AI Backend

Production-grade FastAPI backend for the MedTech AI - Smart Hospital Assistant.

## Features

- **AI Symptom Checking**: Gemini-powered symptom analysis with mandatory safety overrides
- **Voice Chat Pipeline**: STT → AI → TTS for natural voice interactions
- **Emergency SOS System**: Real-time emergency event management
- **Appointment Booking**: Full scheduling with availability management
- **Health Vitals Tracking**: Record and analyze health metrics
- **Role-Based Access**: Patient, Doctor, and Admin roles with appropriate permissions

## Architecture

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/              # FastAPI routes
│   │   └── routes/       # Endpoint modules
│   ├── core/             # Configuration, security, dependencies
│   ├── db/               # Database connection and base models
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   │   └── ai/           # AI services (Gemini, safety rules)
│   └── utils/            # Utility functions
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `GEMINI_API_KEY`: Google Gemini API key

### 4. Database Setup

The backend uses Supabase PostgreSQL. Run migrations:

```bash
alembic upgrade head
```

Or create initial migration:

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5. Run the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/verify` - Verify Supabase JWT token
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update current user
- `POST /api/v1/auth/register` - Register new user

### AI Services
- `POST /api/v1/ai/symptom-check` - AI symptom analysis
- `POST /api/v1/ai/voice-chat` - Voice-based interaction
- `POST /api/v1/ai/chat` - General health chat
- `GET /api/v1/ai/health` - AI service status

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments` - List appointments
- `GET /api/v1/appointments/upcoming` - Upcoming appointments
- `GET /api/v1/appointments/{id}` - Get appointment
- `PUT /api/v1/appointments/{id}` - Update appointment
- `POST /api/v1/appointments/{id}/cancel` - Cancel appointment
- `POST /api/v1/appointments/available-slots` - Get available slots

### Health Vitals
- `POST /api/v1/vitals` - Record vitals
- `GET /api/v1/vitals/latest` - Get latest vitals
- `GET /api/v1/vitals/history` - Get vitals history
- `GET /api/v1/vitals/{id}` - Get specific record
- `PUT /api/v1/vitals/{id}` - Update record
- `DELETE /api/v1/vitals/{id}` - Delete record

### Emergency
- `POST /api/v1/emergency/trigger` - Trigger SOS
- `GET /api/v1/emergency/active` - Get active emergencies
- `GET /api/v1/emergency/my-events` - Patient's events
- `GET /api/v1/emergency/{id}` - Get event details
- `PUT /api/v1/emergency/{id}/status` - Update status
- `PUT /api/v1/emergency/{id}/location` - Update location

### Doctors
- `GET /api/v1/doctors` - List doctors
- `GET /api/v1/doctors/specialties` - List specialties
- `GET /api/v1/doctors/{id}` - Get doctor details
- `POST /api/v1/doctors/search` - Search doctors

## Safety Rules

The AI symptom checker includes mandatory safety overrides:

### Emergency Keywords (Immediate SOS)
- Chest pain, heart attack
- Can't breathe, difficulty breathing
- Stroke, seizure, unconscious
- Severe bleeding
- Overdose, poisoning
- Suicidal ideation

These keywords **ALWAYS** result in `EMERGENCY` risk level regardless of AI analysis.

### High-Risk Keywords
- High fever, blood in urine/stool
- Severe pain, vision loss
- Confusion, severe headache

These upgrade LOW risk assessments to MEDIUM.

## Development

### Code Style

```bash
# Format code
black app/
isort app/

# Type checking
mypy app/

# Linting
flake8 app/
```

### Testing

```bash
pytest tests/ -v
```

## License

Private - All rights reserved.
