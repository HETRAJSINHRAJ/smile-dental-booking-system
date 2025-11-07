# Deployment Guide

## Deploying Admin Portal to Vercel

This monorepo contains three projects:
- `admin-portal` - Admin dashboard (Next.js)
- `patient-portal` - Patient booking portal (Next.js)
- `mobile-app` - Mobile application (Flutter)

### Prerequisites

1. GitHub repository already initialized ✅
2. Vercel account
3. Environment variables ready

### Deploy Admin Portal

#### Step 1: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository: `dental-booking-system-1-main`

#### Step 2: Configure Project Settings

Vercel should auto-detect the configuration from `vercel.json`, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `npm run build` (from root package.json)
- **Output Directory**: `admin-portal/.next`
- **Install Command**: `npm install`

#### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Payment Gateway (if applicable)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Step 4: Deploy

Click "Deploy" and Vercel will:
1. Clone your repository
2. Run `npm install` in root
3. Run `npm run build` (which builds admin-portal)
4. Deploy the admin portal

### Deploy Patient Portal (Separate Project)

To deploy the patient portal as a separate Vercel project:

1. Create a new Vercel project
2. Import the same GitHub repository
3. In project settings, update `vercel.json` or override:
   - **Build Command**: `npm run build:patient`
   - **Output Directory**: `patient-portal/.next`

Or create a separate `vercel.json` in `patient-portal/` directory.

### Local Development

```bash
# Run admin portal locally
npm run dev:admin

# Run patient portal locally
npm run dev:patient

# Build admin portal
npm run build:admin

# Build patient portal
npm run build:patient
```

### Troubleshooting

#### Build fails with "Module not found"
- Ensure all dependencies are in `admin-portal/package.json`
- Check that the build command navigates to the correct directory

#### Environment variables not working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Restart the Vercel deployment after adding variables

#### Wrong directory deployed
- Verify `outputDirectory` in `vercel.json` points to `admin-portal/.next`
- Check that `package.json` build script includes `cd admin-portal`

### Custom Domain

After successful deployment:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Branch Management & Continuous Deployment

#### Selecting Branch During Initial Setup

When importing your repository to Vercel:
1. Click "Import Project"
2. Select your GitHub repository
3. **Choose Production Branch** (dropdown appears)
   - Select `main`, `master`, or any other branch
   - This branch will deploy to your production URL

#### Branch Deployment Behavior

**Production Branch** (e.g., `main`):
- Deploys to: `your-project.vercel.app`
- Automatic deployment on every push
- This is your live/production environment

**Other Branches** (e.g., `dev`, `staging`, `feature/xyz`):
- Deploys to: `your-project-git-branchname.vercel.app`
- Automatic preview deployments
- Perfect for testing before merging to production

**Pull Requests**:
- Get unique preview URLs
- Automatically deployed when PR is created/updated
- URL format: `your-project-git-pr-123.vercel.app`

#### Configure Branch Deployments

Go to **Project Settings → Git**:

1. **Production Branch**:
   - Change which branch is production
   - Click "Edit" next to Production Branch
   - Select from dropdown

2. **Preview Deployments**:
   - **All branches** (default) - Every branch gets deployed
   - **Only production branch** - Disable preview deployments
   - **Ignored Build Step** - Custom logic to skip certain branches

3. **Deploy Hooks**:
   - Create webhook URLs to trigger deployments manually
   - Useful for external CI/CD integration

#### Example Branch Strategy

```
main (production)
├── staging (preview)
├── dev (preview)
└── feature/new-feature (preview)
```

**Workflow:**
1. Develop on `feature/new-feature` → Preview URL generated
2. Merge to `dev` → Dev preview URL updated
3. Merge to `staging` → Staging preview URL updated
4. Merge to `main` → Production deployment

#### Manual Deployment Control

**Redeploy a specific branch:**
1. Go to Deployments tab
2. Find the deployment
3. Click "..." → "Redeploy"

**Deploy from CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy current branch
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
git checkout staging
vercel
```

#### Disable Auto-Deployment for Specific Branches

Create `vercel.json` with ignored build step:

```json
{
  "github": {
    "silent": true,
    "autoJobCancelation": true
  },
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true,
      "dev": false
    }
  }
}
```

Or use Ignored Build Step in Project Settings:
```bash
# Only deploy main and staging branches
bash -c '[[ "$VERCEL_GIT_COMMIT_REF" == "main" || "$VERCEL_GIT_COMMIT_REF" == "staging" ]]'
```

### Monitoring

- View deployment logs in Vercel dashboard
- Check runtime logs for errors
- Set up Vercel Analytics for performance monitoring

## Alternative: Deploy to Other Platforms

### Netlify

1. Connect GitHub repository
2. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: `npm run build`
   - **Publish directory**: `admin-portal/.next`

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty

### Railway

1. Create new project from GitHub
2. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

---

## Notes

- The root `package.json` orchestrates builds for subdirectories
- Each portal can be deployed independently
- Shared Firebase configuration is in the root
- Mobile app deployment is separate (App Store/Play Store)
