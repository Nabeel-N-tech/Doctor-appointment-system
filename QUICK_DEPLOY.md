# ⚡ QUICK DEPLOYMENT COMMANDS

Copy and paste these commands for rapid deployment.

---

## 🔄 STEP 1: Verify Git Push (Already Done ✅)

```bash
git log --oneline -3
# Should show your latest commits
```

**Status**: ✅ Already pushed to GitHub

---

## 📋 STEP 2: Prepare Environment Variables

### Create `.env` for Local Testing

**File**: `backend/.env`
```
SECRET_KEY=your-dev-secret-key
DEBUG=True
STRIPE_SECRET_KEY=sk_test_4eC39HqLyjWDarhtT657j
STRIPE_PUBLISHABLE_KEY=pk_test_51O3VyD2eUVeFG7E7JyXB5YcT
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🎭 STEP 3: Test Locally Before Deploying

```bash
# Terminal 1: Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Backend should run on http://127.0.0.1:8000

# Terminal 2: Frontend
cd doctor-appointment-system
npm install
npm run dev
# Frontend should run on http://127.0.0.1:5173
```

**Test**: Visit http://127.0.0.1:5173 and verify no errors

---

## 🚀 STEP 4: Deploy Backend to Render

### Option A: Using Render Dashboard (Manual)

1. Go to https://render.com
2. Click "+ New" → "Web Service"
3. Select "Doctor-appointment-system" repo
4. Fill in:
   - **Name**: doctor-appointment-system
   - **Root Directory**: backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `gunicorn backend.wsgi --log-file -`

5. Click "Create Web Service"

### Set Environment Variables:

```
SECRET_KEY=<generate-new-secret>
DEBUG=False
ALLOWED_HOSTS=doctor-appointment-system-xxxx.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.com
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Wait**: 2-5 minutes for deployment

**Verify**:
```bash
curl https://your-domain.onrender.com/api/accounts/stripe-config/
# Should return JSON (not error)
```

---

## 🎨 STEP 5: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Manual)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Select "Doctor-appointment-system"
5. Fill in:
   - **Project Name**: doctor-appointment-system
   - **Framework**: React
   - **Root Directory**: doctor-appointment-system

6. Click "Deploy"

### Set Environment Variables:

```
VITE_API_URL=https://your-backend-domain.onrender.com/api/accounts
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Wait**: 1-3 minutes for build

**Verify**: Visit https://your-domain.vercel.app

---

## 🧪 STEP 6: Test Production Deployment

### Test 1: API Connectivity
```bash
curl https://your-backend.onrender.com/api/accounts/stripe-config/
```

Expected: JSON with stripe key

### Test 2: Frontend Access
```bash
# Visit in browser
https://your-frontend.vercel.app
```

Expected: Landing page loads

### Test 3: Complete Flow
1. Register new patient
2. Login
3. Book appointment
4. Click "Pay Now"
5. Use test card: **4242 4242 4242 4242**
6. Any future date & CVC
7. Complete payment

Expected: ✅ Appointment confirmed

---

## ⚙️ STEP 7: Configure CORS (After Both Deployed)

**On Render Dashboard**:

1. Go to backend service
2. Click "Environment"
3. Update `CORS_ALLOWED_ORIGINS`:
```
https://your-frontend.vercel.app
```
4. Click "Save"

**Wait**: ~2 minutes for restart

---

## 🔍 VERIFICATION CHECKLIST

```bash
# Check 1: Backend responding
curl https://your-backend.onrender.com/api/accounts/stripe-config/

# Check 2: Frontend loads
curl https://your-frontend.vercel.app

# Check 3: CORS working
# Visit frontend, open DevTools Console
# Should NOT see CORS errors

# Check 4: API calls work
# Login in app, should see no 401 errors

# Check 5: Payment secure
# Test payment flow with test card
# Should verify with Stripe backend
```

---

## 📊 Monitoring Commands

### Check Render Logs:
```bash
# Via CLI (if installed)
render logs --project doctor-appointment-system

# Or via Dashboard:
# 1. Go to your service
# 2. Click "Logs" tab
# 3. View real-time output
```

### Check Build Status:
```bash
# Vercel Dashboard:
# 1. Go to project
# 2. Click "Deployments"
# 3. View latest build logs

# Render Dashboard:
# 1. Go to service
# 2. View "Latest Deploy" status
```

---

## 🆘 Quick Troubleshooting

### CORS Error
```bash
# Check CORS setting on Render
# Make sure CORS_ALLOWED_ORIGINS = your Vercel domain
# Restart service: Click "Deploy" → "Redeploy"
```

### Payment Fails
```bash
# Check Stripe keys are live (not test)
# Verify payment intent created
# Check Stripe dashboard for declined charges
```

### Database Error
```bash
# Check migrations ran
# Run migrations again:
#   Build Command: python manage.py migrate
# Restart service
```

### 401 Unauthorized
```bash
# Check token is being sent
# Open DevTools → Network
# Check Authorization header included
# Verify token in localStorage
```

---

## 📈 Post-Deployment Checklist

```
[ ] Backend deployed and responding
[ ] Frontend deployed and loads
[ ] CORS configured between services
[ ] Login/registration works
[ ] Test payment flow completed
[ ] Doctor features verified
[ ] Admin features verified
[ ] Error boundary working
[ ] Monitoring set up
[ ] Team notified of live URLs
[ ] Documentation shared
```

---

## 🎯 Important Reminders

✅ **Test Payment Flow First**
- Use test card: 4242 4242 4242 4242
- Verify Stripe confirms payment
- Check appointment status updates

✅ **Use Production Stripe Keys**
- Backend: sk_live_xxx
- Frontend: pk_live_xxx
- NOT test keys (sk_test_, pk_test_)

✅ **Security Verification**
- [ ] No print statements in logs
- [ ] DEBUG = False in production
- [ ] SECRET_KEY not in code
- [ ] CORS whitelist configured
- [ ] ALLOWED_HOSTS whitelist configured

✅ **Update CORS After Frontend Deployed**
- Backend CORS must include Vercel domain
- Restart backend service
- Test API calls work

✅ **Monitor Errors Daily**
- Check Render logs
- Check Vercel logs
- Review Stripe dashboard

---

## 📞 Quick Reference URLs

```
GitHub: https://github.com/Nabeel-N-tech/Doctor-appointment-system

Render Dashboard: https://render.com/dashboard
Vercel Dashboard: https://vercel.com/dashboard
Stripe Dashboard: https://dashboard.stripe.com

After Deployment:
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.onrender.com
- API: https://your-backend.onrender.com/api/accounts/
```

---

## ⏱️ Time Estimates

```
Backend to Render:    30 minutes (setup + waiting for deploy)
Frontend to Vercel:   20 minutes (setup + waiting for build)
CORS Configuration:   5 minutes
Testing:              30 minutes
Total:                ~85 minutes (1.5 hours)
```

---

## ✅ YOU'RE ALL SET!

Everything is prepared and ready to deploy. Follow the steps above and your app will be live in under 2 hours!

**Questions?** See detailed guides:
- `DEPLOYMENT_GUIDE.md` - Step-by-step
- `SECURITY_AND_IMPROVEMENTS.md` - Security details
- `QUICK_REFERENCE.md` - Usage help

---

**Happy Deploying! 🚀**

