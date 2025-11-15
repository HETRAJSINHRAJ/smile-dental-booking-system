# Cron Job Setup Guide

## 🔐 Setting Up CRON_SECRET

The `CRON_SECRET` is used to secure your scheduled notification reminder endpoint so only authorized cron jobs can trigger it.

## 📍 Where to Set CRON_SECRET

### Option 1: Vercel (Recommended for Next.js apps)

#### Step 1: Generate a Secret Key

Generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### Step 2: Add to Vercel Environment Variables

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project (admin-portal or patient-portal)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** Your generated secret (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`)
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

**Via Vercel CLI:**
```bash
cd admin-portal  # or patient-portal
vercel env add CRON_SECRET
# Paste your secret when prompted
# Select all environments
```

#### Step 3: Redeploy

After adding the environment variable, redeploy your app:
```bash
vercel --prod
```

### Option 2: Local Development (.env file)

For local testing, create a `.env.local` file:

**admin-portal/.env.local:**
```env
CRON_SECRET=your_secret_key_here
```

**patient-portal/.env.local:**
```env
CRON_SECRET=your_secret_key_here
```

⚠️ **Important:** Never commit `.env.local` files to Git!

Add to `.gitignore`:
```
.env.local
.env*.local
```

### Option 3: Other Hosting Providers

#### Netlify
1. Go to Site Settings → Build & Deploy → Environment
2. Add `CRON_SECRET` variable
3. Redeploy

#### Railway
1. Go to your project
2. Click on Variables tab
3. Add `CRON_SECRET`
4. Redeploy

#### AWS Amplify
1. Go to App Settings → Environment Variables
2. Add `CRON_SECRET`
3. Redeploy

#### Heroku
```bash
heroku config:set CRON_SECRET=your_secret_key_here -a your-app-name
```

## 🔄 Vercel Cron Job Configuration

The `vercel.json` file is already configured:

```json
{
  "crons": [
    {
      "path": "/api/notifications/schedule-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9:00 AM UTC.

### Cron Schedule Syntax

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
- `0 9 * * *` - Every day at 9:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 8,20 * * *` - At 8:00 AM and 8:00 PM
- `0 9 * * 1-5` - Weekdays at 9:00 AM
- `30 8 * * *` - Every day at 8:30 AM

### Change Cron Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/schedule-reminders",
      "schedule": "0 8 * * *"  // Change to 8:00 AM
    }
  ]
}
```

Then redeploy:
```bash
vercel --prod
```

## 🧪 Testing the Cron Job

### Test Locally

```bash
# Start your development server
cd admin-portal
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3001/api/notifications/schedule-reminders \
  -H "Authorization: Bearer your_secret_key_here"
```

### Test on Production

```bash
curl -X POST https://your-domain.com/api/notifications/schedule-reminders \
  -H "Authorization: Bearer your_secret_key_here"
```

Expected response:
```json
{
  "success": true,
  "message": "Sent 5 appointment reminders",
  "count": 5
}
```

## 🔍 Verify Cron Job is Running

### Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Select latest deployment
4. Click **Functions** tab
5. Look for `/api/notifications/schedule-reminders` logs

### Check Firestore

Query the `notifications` collection to see if reminders were sent:

```javascript
// In Firebase Console or your app
const today = new Date();
today.setHours(0, 0, 0, 0);

const notifications = await db
  .collection('notifications')
  .where('type', '==', 'appointment_reminder')
  .where('sentAt', '>=', today)
  .get();

console.log(`Sent ${notifications.size} reminders today`);
```

## 🛠️ Alternative: Manual Cron Setup

If not using Vercel, set up a cron job on your server:

### Linux/Mac (crontab)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM)
0 9 * * * curl -X POST https://your-domain.com/api/notifications/schedule-reminders -H "Authorization: Bearer your_secret_key_here"
```

### GitHub Actions

Create `.github/workflows/cron-notifications.yml`:

```yaml
name: Send Appointment Reminders

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Reminders
        run: |
          curl -X POST https://your-domain.com/api/notifications/schedule-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CRON_SECRET`
4. Value: Your secret key

### AWS EventBridge

1. Create Lambda function that calls your API
2. Set up EventBridge rule with cron expression
3. Store `CRON_SECRET` in AWS Secrets Manager

### Google Cloud Scheduler

1. Create Cloud Scheduler job
2. Set schedule: `0 9 * * *`
3. Target: HTTP
4. URL: `https://your-domain.com/api/notifications/schedule-reminders`
5. Add header: `Authorization: Bearer your_secret_key`

## 🔐 Security Best Practices

1. **Use Strong Secrets**
   - Minimum 32 characters
   - Use cryptographically secure random generation
   - Never use predictable values

2. **Rotate Secrets Regularly**
   - Change every 90 days
   - Update in all environments

3. **Limit Access**
   - Only store in secure environment variables
   - Never commit to Git
   - Don't log the secret value

4. **Monitor Usage**
   - Check logs for unauthorized attempts
   - Set up alerts for failures
   - Track successful executions

5. **Use Different Secrets**
   - Different secret for each environment (dev, staging, prod)
   - Different secret for each project if needed

## 📊 Monitoring

### Set Up Alerts

**Vercel:**
1. Go to Project Settings → Notifications
2. Enable "Failed Function Invocations"
3. Add your email

**Custom Monitoring:**

```typescript
// In your cron endpoint
export async function POST(request: NextRequest) {
  try {
    const sentCount = await notificationService.scheduleAppointmentReminders();
    
    // Log success
    console.log(`✅ Cron job successful: Sent ${sentCount} reminders`);
    
    // Optional: Send to monitoring service
    await fetch('https://your-monitoring-service.com/log', {
      method: 'POST',
      body: JSON.stringify({
        service: 'appointment-reminders',
        status: 'success',
        count: sentCount,
        timestamp: new Date().toISOString(),
      }),
    });
    
    return NextResponse.json({ success: true, count: sentCount });
  } catch (error) {
    // Log error
    console.error('❌ Cron job failed:', error);
    
    // Optional: Send alert
    await fetch('https://your-monitoring-service.com/alert', {
      method: 'POST',
      body: JSON.stringify({
        service: 'appointment-reminders',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    });
    
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## 🐛 Troubleshooting

### Cron Job Not Running

1. **Check Vercel Logs**
   - Verify cron job is scheduled
   - Check for errors in function logs

2. **Verify Environment Variable**
   ```bash
   # In your API route, temporarily log (remove after testing)
   console.log('CRON_SECRET exists:', !!process.env.CRON_SECRET);
   ```

3. **Test Manually**
   ```bash
   curl -X POST https://your-domain.com/api/notifications/schedule-reminders \
     -H "Authorization: Bearer your_secret" \
     -v
   ```

4. **Check Timezone**
   - Vercel cron runs in UTC
   - Convert your desired time to UTC

### Unauthorized Errors

1. **Verify Secret Matches**
   - Check environment variable value
   - Ensure no extra spaces or characters

2. **Check Header Format**
   ```bash
   # Correct format
   Authorization: Bearer your_secret_key
   
   # Not this
   Authorization: your_secret_key
   ```

### No Reminders Sent

1. **Check Appointments**
   - Verify there are appointments tomorrow
   - Check appointment status is 'confirmed'

2. **Check FCM Tokens**
   - Verify users have active FCM tokens
   - Check token validity

3. **Check Logs**
   - Look for errors in notification sending
   - Verify Firebase Admin SDK is initialized

## 📝 Summary

1. Generate a secure random secret
2. Add `CRON_SECRET` to Vercel environment variables
3. Redeploy your application
4. Verify cron job runs daily at 9 AM
5. Monitor logs and notifications

**Quick Setup:**
```bash
# 1. Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Add to Vercel
vercel env add CRON_SECRET

# 3. Deploy
vercel --prod

# 4. Test
curl -X POST https://your-domain.com/api/notifications/schedule-reminders \
  -H "Authorization: Bearer your_secret"
```

---

**Need Help?**
- Check Vercel Cron documentation: https://vercel.com/docs/cron-jobs
- Review API route logs in Vercel dashboard
- Test endpoint manually with curl
