# ⚠️ CRITICAL DEPLOYMENT FIX

Your data is disappearing because your Render deployment is falling back to a temporary SQLite database instead of using your persistent PostgreSQL database (Neon).

To fix this, you must explicitly set the Environment Variables in your Render Dashboard.

## Step 1: Go to Render Dashboard
1. Open your **Render** dashboard.
2. Select your **Backend Web Service**.
3. Click on the **"Environment"** tab.

## Step 2: Add Keys
Click **"Add Environment Variable"** and add the following keys (copy exactly from your local `.env` file):

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://... (Use your Neon DB URL)` |
| `SECRET_KEY` | `... (Use the secret key from your local .env)` |
| `DEBUG` | `False` |
| `STRIPE_SECRET_KEY` | `... (Use the stripe secret key from your local .env)` |
| `STRIPE_PUBLISHABLE_KEY` | `... (Use the stripe publishable key from your local .env)` |

## Step 3: Redistribute/Deploy
Once these keys are saved, Render will restart your service. It will now connect to the Neon PostgreSQL database, and your data will persist forever, even between deploys.
