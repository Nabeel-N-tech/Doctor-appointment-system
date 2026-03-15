# 🏥 Doctor Appointment System - Complete Project Guide

## Project Overview

A full-stack telemedicine and healthcare appointment management system built with React, Django, and Stripe. Enables patients to book appointments with doctors, make payments, conduct video consultations, and manage medical records.

**Status**: ✅ Production-Ready (with security enhancements applied)

---

## 🎯 Key Features

### Patient Features
- 📋 Browse and search doctors
- 📅 Book appointments (in-person or online)
- 💳 Secure Stripe payments
- 🎥 Video consultations (Daily.co)
- 📊 View medical history and lab reports
- 🔔 Real-time notifications

### Doctor Features
- 👥 Manage appointment queue with token system
- 📝 Create medical records and prescriptions
- 🧪 Order lab tests
- 📈 View practice analytics and insights
- 👨‍⚕️ Doctor-to-doctor referrals
- ⏱️ Toggle availability

### Admin Features
- 👤 User management (create, edit, delete)
- 📊 System-wide analytics
- 💰 Revenue tracking and trends
- 🔍 Oversight of all appointments

### Staff Features
- 🧪 Create and manage lab reports
- 💊 Dispense prescriptions

---

## 🏗️ Technology Stack

### Frontend
- React 19.2.0
- Vite 7.2.4 (build tool)
- TailwindCSS 4.1.18 (styling)
- Stripe.js (payments)
- Daily.co (video calls)
- React Router 7.11.0
- React Hot Toast (notifications)
- Framer Motion (animations)

### Backend
- Django 5.2.8
- Django REST Framework
- JWT Authentication
- PostgreSQL (production)
- SQLite (development)
- Stripe Python SDK
- WhiteNoise (static files)
- CORS Headers

### Deployment
- Backend: Render.com
- Frontend: Vercel

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (production)

### Backend Setup

```bash
# Clone repository
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Copy .env.example to .env and configure

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start dev server
python manage.py runserver
# Server runs on http://127.0.0.1:8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd doctor-appointment-system

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend runs on http://127.0.0.1:5173
```

---

## 🔐 Security Enhancements Applied

### ✅ Payment Processing
- **Fixed**: Server-side Stripe PaymentIntent verification
- **Now**: Backend validates payments with Stripe, not client
- **Prevents**: Fake payments and payment tampering

### ✅ Environment Variables
- **Removed**: Hardcoded credentials (base64 encoded keys)
- **Now**: All sensitive values from environment only
- **Enforced**: Production requires SECRET_KEY in env

### ✅ CORS Security
- **Changed**: From `CORS_ALLOW_ALL_ORIGINS = True` to whitelist
- **Now**: Only specific domains allowed
- **Prevents**: Cross-origin attacks

### ✅ Host Header Validation
- **Changed**: From `ALLOWED_HOSTS = ["*"]` to whitelist
- **Now**: Validates Host header against allowed list
- **Prevents**: Host header injection attacks

### ✅ Error Boundaries
- **Added**: React Error Boundary component
- **Prevents**: App crash on component errors
- **Shows**: User-friendly error UI

### ✅ Error Handling
- **Enhanced**: API client with better error messages
- **Improved**: User-friendly error notifications
- **Removed**: Debug print statements (proper logging)

---

## 📁 Project Structure

```
final_project/
├── backend/                           # Django REST API
│   ├── accounts/                      # Main app
│   │   ├── models.py                  # Database models
│   │   ├── views.py                   # API endpoints
│   │   ├── serializers.py             # Data serializers
│   │   ├── urls.py                    # URL routing
│   │   └── migrations/                # Database migrations
│   ├── backend/
│   │   ├── settings.py                # Django config (✅ FIXED)
│   │   ├── urls.py                    # Root URLs
│   │   └── wsgi.py                    # Production entry
│   ├── .env.example                   # ✅ NEW: Environment template
│   ├── manage.py
│   └── requirements.txt
│
├── doctor-appointment-system/         # React Frontend
│   ├── src/
│   │   ├── api/                       # API client layer
│   │   ├── auth/                      # Authentication
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   └── Router.jsx
│   │   ├── pages/                     # Shared pages
│   │   ├── roles/                     # Role-based dashboards
│   │   ├── components/
│   │   │   ├── error/
│   │   │   │   └── ErrorBoundary.jsx  # ✅ NEW: Error handling
│   │   │   ├── payment/               # Stripe modal (✅ IMPROVED)
│   │   │   ├── navigation/
│   │   │   ├── ui/                    # Reusable UI
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── helpers.js             # ✅ NEW: Utility functions
│   │   ├── main.jsx                   # Entry point (✅ UPDATED)
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── SECURITY_AND_IMPROVEMENTS.md       # ✅ NEW: Complete documentation
├── .env.example                       # ✅ NEW: Environment template
└── README.md                          # This file
```

---

## 🔧 Configuration

### Required Environment Variables

**Backend (.env)**
```
SECRET_KEY=your-secret-key
DEBUG=False  # Set to False in production!
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://127.0.0.1:8000/api/accounts
```

See `.env.example` for all available options.

---

## 💳 Testing Payment Flow

### Using Stripe Test Cards

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

### Complete Test Flow
1. Register as patient
2. Search for doctor
3. Book appointment
4. Click "Pay Now"
5. Use test card above
6. Payment verifies with Stripe and confirms
7. Doctor receives appointment notification

---

## 🎥 Video Call Setup

Currently requires Daily.co integration (in progress).

**To Enable**:
1. Get Daily.co API key from https://dashboard.daily.co
2. Add to .env: `DAILY_API_KEY=...`
3. Implement room creation in backend
4. Update VideoCall.jsx with Daily.co SDK

---

## 📊 API Endpoints

### Authentication
- `POST /api/accounts/register/` - Register patient
- `POST /api/accounts/login/` - Login
- `POST /api/accounts/request-reset/` - Request password reset

### Appointments
- `GET /api/accounts/appointments/` - List appointments
- `POST /api/accounts/appointments/create/` - Book appointment
- `PATCH /api/accounts/appointments/{id}/status/` - Update status
- `POST /api/accounts/appointments/{id}/pay/` - Confirm payment (✅ IMPROVED)

### Payment
- `GET /api/accounts/stripe-config/` - Get Stripe key
- `POST /api/accounts/appointments/create-payment-intent/{id}/` - Create payment

### Medical Records
- `GET /api/accounts/medical-records/{patient_id}/` - Get records
- `POST /api/accounts/medical-records/create/` - Create record

### Lab Reports
- `GET /api/accounts/lab-reports/` - List reports
- `POST /api/accounts/lab-reports/create/` - Create report

See `SECURITY_AND_IMPROVEMENTS.md` for complete API documentation.

---

## 📝 Database Models

### User
- Custom user model with roles (patient, doctor, admin, staff)
- Profile fields: age, gender, blood_group, medical_history
- Doctor-specific: specialization, consultation_fee

### Appointment
- Links patient to doctor
- Status flow: pending → confirmed → in_progress → completed
- Includes vitals, diagnosis, payment status, token number

### Medical Records
- Doctor-created records with diagnosis and treatment plan
- Linked to appointment
- Searchable history

### Lab Reports
- Staff-created with clinical interpretation
- Test results, reference ranges, specimen type
- File attachments supported

### Prescriptions
- Doctor-written medicines
- Dispensing tracking by staff

### Notifications
- Real-time notifications for all events
- Read/unread status

---

## ✨ Recent Improvements

### Security Fixes (✅ COMPLETED)
- ✅ Payment verification with Stripe
- ✅ Removed hardcoded credentials
- ✅ CORS whitelist configuration
- ✅ Host header validation

### Code Quality (✅ COMPLETED)
- ✅ Error Boundary component
- ✅ Utility helpers library
- ✅ Enhanced API client
- ✅ Better error handling
- ✅ Proper logging setup

### UI/UX (🔄 IN PROGRESS)
- 🔄 Video call integration
- ⏳ Loading states consistency
- ⏳ Accessibility improvements

---

## 🐛 Known Issues & Roadmap

### High Priority
- [ ] Complete Daily.co video implementation
- [ ] Add appointment conflict detection
- [ ] Input validation for all forms
- [ ] Token refresh mechanism

### Medium Priority
- [ ] SMS/WhatsApp notifications (currently console)
- [ ] Pagination for large datasets
- [ ] Time-slot based booking

### Lower Priority
- [ ] Mobile app / PWA
- [ ] Advanced analytics
- [ ] Internationalization (i18n)
- [ ] HIPAA compliance

---

## 🚀 Deployment

### Render (Backend)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect GitHub to Render
# - Create new Web Service
# - Select GitHub repository
# - Set environment variables

# 3. Required environment variables:
SECRET_KEY=<generate-new>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
DEBUG=False
ALLOWED_HOSTS=yourdomain.onrender.com
DATABASE_URL=postgresql://...
```

### Vercel (Frontend)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard:
VITE_API_URL=https://your-backend.onrender.com/api/accounts
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Payment fails to verify**
- Check STRIPE_SECRET_KEY is set correctly
- Verify Stripe test keys are used for testing
- Check browser console for client-side errors

**CORS errors**
- Verify CORS_ALLOWED_ORIGINS includes your frontend URL
- Check backend logs for CORS rejection

**Video calls not working**
- Daily.co setup not complete (in progress)
- Check DAILY_API_KEY is set

**404 errors**
- Verify ALLOWED_HOSTS includes your domain
- Check API routing in Django

---

## 📚 Documentation

- **SECURITY_AND_IMPROVEMENTS.md** - Detailed security fixes and deployment guide
- **.env.example** - Environment configuration template
- **DESIGN_SPEC.md** - UI/UX design system
- **DEPLOY_INSTRUCTIONS.md** - Deployment guide

---

## 👥 User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **Patient** | 🟢 Public | Book appointments, pay, view records |
| **Doctor** | 🟡 Private | Manage queue, create records, analytics |
| **Admin** | 🔴 Restricted | User management, system oversight |
| **Staff** | 🟡 Private | Lab reports, prescription dispensing |

---

## 📈 Project Status

- ✅ **MVP Complete**: All core features implemented
- ✅ **Security**: Critical fixes applied
- 🔄 **In Progress**: Video calls, validation
- ⏳ **Planned**: Testing, optimization, mobile

**Last Updated**: March 15, 2025
**Deployment Ready**: ⚠️ After testing payment flow

---

## 📄 License

This project is for educational purposes.

---

## 🙋 Questions?

Refer to `SECURITY_AND_IMPROVEMENTS.md` for:
- Detailed security fixes
- Deployment checklist
- Environment variable guide
- Testing tips

