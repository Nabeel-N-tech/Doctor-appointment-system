# 🚀 DEPLOYMENT GUIDE - RENDER (Backend) & VERCEL (Frontend)

## ✅ PREREQUISITES

- ✅ GitHub account with code pushed
- ✅ Render account (render.com)
- ✅ Vercel account (vercel.com)
- ✅ Stripe account (dashboard.stripe.com)
- ✅ (Optional) Custom domain

---

## 📦 PART 1: DEPLOY BACKEND TO RENDER

### Step 1: Prepare Backend Environment

**1.1 Update settings.py for production**

Verify these production settings are in place:
```python
# backend/settings.py
DEBUG = os.getenv('DEBUG', 'False') == 'True'  # Should be False in prod
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
SECRET_KEY = os.getenv('SECRET_KEY')  # MUST be set in Render
```

**1.2 Create Procfile (if not exists)**
```bash
echo "web: gunicorn backend.wsgi --log-file -" > backend/Procfile
```

**1.3 Ensure requirements.txt is up to date**
```bash
cd backend
pip freeze > requirements.txt
```

### Step 2: Create Render Web Service

1. Go to **https://render.com** and login
2. Click **+ New** → **Web Service**
3. Select **Connect a repository**
4. Choose **Doctor-appointment-system** repo
5. Configure:
   - **Name**: `doctor-appointment-system` (or your choice)
   - **Environment**: `Python 3.10`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `gunicorn backend.wsgi --log-file -`
   - **Plan**: Choose Free or Paid

### Step 3: Set Environment Variables on Render

Click **Environment** in Render dashboard and add these variables:

```
SECRET_KEY = (generate: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

DEBUG = False

ALLOWED_HOSTS = doctor-appointment-system-xxxx.onrender.com

CORS_ALLOWED_ORIGINS = https://your-vercel-frontend.com

DATABASE_URL = (Render auto-creates PostgreSQL, copy URL here)

STRIPE_SECRET_KEY = sk_live_... (from Stripe dashboard)

STRIPE_PUBLISHABLE_KEY = pk_live_... (from Stripe dashboard)

DJANGO_SETTINGS_MODULE = backend.settings
```

### Step 4: Verify Backend Deployment

1. Wait for build to complete (~2-5 minutes)
2. Check deployment status (should show "Live")
3. Click the URL to test
4. Should return error message (expected - requires auth)

**Test endpoint**:
```bash
curl https://your-backend.onrender.com/api/accounts/stripe-config/
```

Expected response:
```json
{"error": "Authentication credentials were not provided."}
```

✅ **Backend is live!**

---

## 🎨 PART 2: DEPLOY FRONTEND TO VERCEL

### Step 1: Prepare Frontend

**1.1 Build production bundle**
```bash
cd doctor-appointment-system
npm install
npm run build
```

Verify `dist/` folder is created.

**1.2 Update vite.config.js if needed**
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  },
  // ... rest of config
}
```

### Step 2: Connect to Vercel

1. Go to **https://vercel.com** and login
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select **Doctor-appointment-system** repo
5. Configure:
   - **Project Name**: `doctor-appointment-system`
   - **Framework**: `React`
   - **Root Directory**: `./doctor-appointment-system`

### Step 3: Set Environment Variables on Vercel

In Vercel project settings, click **Environment Variables** and add:

```
VITE_API_URL = https://your-backend-url.onrender.com/api/accounts

STRIPE_PUBLISHABLE_KEY = pk_live_... (from Stripe)
```

### Step 4: Deploy to Vercel

1. Click **Deploy**
2. Wait for build (~3-5 minutes)
3. Check status (should show "Ready")
4. Click domain to view live app

**Test URL**: `https://your-frontend.vercel.app`

✅ **Frontend is live!**

---

## 🔗 STEP 3: CONFIGURE CORS BETWEEN FRONTEND & BACKEND

After both are deployed, update CORS on Render:

**On Render Dashboard**:
1. Go to your backend service
2. Click **Environment**
3. Update `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
```
4. Click **Save**
5. Wait for re-deployment (~2 minutes)

---

## 🧪 TESTING DEPLOYMENT

### Test 1: API Connectivity

**Test from browser console**:
```javascript
fetch('https://your-backend.onrender.com/api/accounts/stripe-config/')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return Stripe publishable key.

### Test 2: Registration

1. Go to `https://your-vercel-app.vercel.app`
2. Click **Register**
3. Create patient account
4. Should succeed

### Test 3: Login

1. Click **Login**
2. Use credentials from registration
3. Should redirect to dashboard

### Test 4: Payment Flow (CRITICAL)

⚠️ **Use Stripe Test Card**: `4242 4242 4242 4242`

1. Login as patient
2. Book appointment
3. Click "Pay Now"
4. Enter test card
5. Complete payment
6. ✅ Should confirm with Stripe and show success

### Test 5: Doctor Features

1. Register as doctor (create via admin or direct registration)
2. Login as doctor
3. View appointment queue
4. Verify can update appointment status
5. Can create medical records

### Test 6: Admin Features

1. Access admin panel
2. Create/edit/delete users
3. View analytics
4. All CRUD operations work

---

## 🔐 SECURITY CHECKLIST FOR PRODUCTION

- [ ] ✅ STRIPE_SECRET_KEY is sk_live_ (not sk_test_)
- [ ] ✅ STRIP_PUBLISHABLE_KEY is pk_live_ (not pk_test_)
- [ ] ✅ SECRET_KEY is strong random (not in code)
- [ ] ✅ DEBUG = False
- [ ] ✅ ALLOWED_HOSTS includes only your domain
- [ ] ✅ CORS_ALLOWED_ORIGINS includes only your frontend
- [ ] ✅ Database is PostgreSQL (not SQLite)
- [ ] ✅ HTTPS is enforced (automatic on Vercel/Render)
- [ ] ✅ Tested payment flow with test card
- [ ] ✅ Error messages don't expose internal details
- [ ] ✅ No print() statements in logs
- [ ] ✅ Logging properly configured
- [ ] ✅ CSRF protection enabled

---

## 🚨 TROUBLESHOOTING

### Backend Won't Deploy

**Problem**: Build fails on Render
**Solution**:
```bash
# In backend/
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push origin main
# Restart deploy on Render
```

### CORS Errors

**Problem**: Frontend gets "CORS error"
**Solution**:
1. Check CORS_ALLOWED_ORIGINS on Render includes your Vercel domain
2. Restart backend service
3. Verify frontend API URL is correct

### Payment Fails

**Problem**: Stripe payment verification fails
**Solution**:
1. Verify STRIPE_SECRET_KEY is sk_live_ (not sk_test_)
2. Check Stripe dashboard for failed charges
3. Verify payment intent creation works
4. Test with Stripe test card

### Database Connection Error

**Problem**: "Database connection refused"
**Solution**:
1. Render creates PostgreSQL automatically
2. Check DATABASE_URL is set on Render
3. Verify migrations ran (check Render logs)

### 401 Unauthorized Error

**Problem**: Getting 401 on API calls
**Solution**:
1. Ensure login returns tokens
2. Check localStorage has `access_token`
3. Verify token is sent in Authorization header

---

## 📊 MONITORING PRODUCTION

### Track Errors
- Use Render's built-in logs
- Check Vercel's deployment logs
- Monitor Stripe dashboard for payment issues

### View Logs

**Render**:
1. Go to service page
2. Click **Logs** tab
3. View real-time logs

**Vercel**:
1. Go to project page
2. Click **Deployments**
3. Click latest deployment
4. View logs

### Health Check API

Test API is responsive:
```bash
curl https://your-backend.onrender.com/api/accounts/stripe-config/
```

Should return without timeout or 500 errors.

---

## 🔄 UPDATING PRODUCTION

### When you push new code:

1. **Push to GitHub**:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

2. **Render auto-deploys** (takes 2-5 minutes)

3. **Vercel auto-deploys** (takes 1-3 minutes)

4. **Verify deployment**:
- Check service status shows "Live"
- Test key features

---

## 💡 IMPORTANT REMINDERS

✅ **Never commit .env files**
- Environment variables only in dashboard

✅ **Use production Stripe keys**
- sk_live_ for backend
- pk_live_ for frontend

✅ **Backup database regularly**
- Render provides automatic snapshots
- Download periodically

✅ **Monitor costs**
- Render: ~$7/month for basic
- Vercel: Free tier available
- Stripe: 2.9% + $0.30 per transaction

✅ **Test payment flow weekly**
- Use test card: 4242 4242 4242 4242
- Verify booking → payment → confirmation

---

## 📞 DEPLOYMENT SUPPORT

### Common Render Issues:
- **GitHub integration**: Ensure permissions are set
- **Build fails**: Check requirements.txt is in backend/
- **Env vars not applied**: Click "Save" after updates
- **Service won't start**: Check logs for errors

### Common Vercel Issues:
- **Build fails**: Check root directory is correct
- **API calls fail**: Check VITE_API_URL is correct
- **Env vars missing**: Ensure they're in Environment Variables
- **CORS errors**: Verify backend CORS includes Vercel domain

---

## ✅ FINAL CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render (shows "Live")
- [ ] Frontend deployed to Vercel (shows "Ready")
- [ ] Environment variables set on both
- [ ] Database connected and migrated
- [ ] Stripe keys configured (live keys)
- [ ] CORS configured between services
- [ ] API connectivity tested
- [ ] Login/registration works
- [ ] Payment flow tested with test card
- [ ] Doctor features tested
- [ ] Admin features tested
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Production URL shared with team

---

## 🎉 DEPLOYMENT COMPLETE!

Your Doctor Appointment System is now **LIVE** and **PRODUCTION-READY**!

**URLs**:
- Frontend: https://your-app.vercel.app
- Backend API: https://your-backend.onrender.com/api/accounts/

**Next Steps**:
1. Test all features thoroughly
2. Monitor error logs daily
3. Plan backup strategy
4. Set up additional monitoring (Sentry, DataDog)
5. Document any customizations
6. Train users on system

**CONGRATS! 🚀**

---

**Last Updated**: March 15, 2025
**Version**: Production v1.0
