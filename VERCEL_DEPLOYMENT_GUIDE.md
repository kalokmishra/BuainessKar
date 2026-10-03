# 🚀 Vercel Deployment & Environment Variables Guide

This guide details how to build and deploy **Businesskar** to [Vercel](https://vercel.com) with secure environment variables and zero hardcoded secrets.

---

## 1. Prerequisites

- A [Vercel Account](https://vercel.com/signup)
- A connected GitHub / GitLab / Bitbucket repository
- Your Firebase Project configuration parameters (from Firebase Console ➔ Project Settings ➔ General ➔ Your apps)

---

## 2. Environment Variables Configuration

In your Vercel Project Settings (under **Settings ➔ Environment Variables**), add the following variables for all deployment environments (**Production**, **Preview**, **Development**):

| Environment Variable | Description | Example / Source |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `global-fort-mfht8` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `global-fort-mfht8.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | `global-fort-mfht8.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `952143367787` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:952143367787:web:cf5f5c092894c77742eb2e` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Custom Firestore Database ID (if applicable) | `ai-studio-taxutilitymvpsec-73c0f477-424e-4989-b3d1-90275716ca08` |
| `VITE_FIREBASE_MEASUREMENT_ID` | *(Optional)* Google Analytics Measurement ID | `G-XXXXXXXXXX` (leave blank if not using Analytics) |
| `GEMINI_API_KEY` | *(Optional)* Gemini AI API key for AI Copilot | Available in Google AI Studio |

> **Note**: Vite bundles variables starting with `VITE_` into client code at build time. Variables without the `VITE_` prefix remain server-side only.

---

## 3. Deployment Configuration (`vercel.json`)

Businesskar includes a pre-configured `vercel.json` in the root repository directory:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures Single Page Application (SPA) client-side routing functions correctly for all tabs and modals without 404 errors.

---

## 4. Deploying via Vercel CLI

You can deploy directly from your local terminal using the Vercel CLI:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Link project & deploy preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## 5. Security & Secret Leak Prevention

1. **`.env` files are ignored**: `.gitignore` strictly blocks all `.env*` files (except `.env.example`).
2. **Pre-commit scanning**: Pre-commit hooks (`.pre-commit-config.yaml`) run git-secrets and gitleaks scans prior to git commits.
3. **No hardcoded fallback keys**: `src/firebase.ts` loads dynamically from environment variables first, falling back to local configuration only when running inside authorized development environments.
4. **Google Sign-In Authorized Domains**: Add your Vercel domain (`your-app.vercel.app`) to:
   - **Firebase Console ➔ Authentication ➔ Settings ➔ Authorized Domains**
   This allows Google 1-Click popup sign-in to authenticate users on your Vercel deployment.
