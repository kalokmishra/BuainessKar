# Businesskar Developer & Security Guide

## 🔐 Firebase Configuration & Secrets Policy

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values in `.env.local`. For Vite client development, use the `VITE_FIREBASE_*` variables.

3. **Never commit `.env.local`** — it is strictly ignored in `.gitignore`.

### Security Invariants

❌ **NEVER DO THIS:**
- Do not commit `.env.local`, `.env`, or any `.env.*` files (except `.env.example`).
- Do not hardcode API keys or secrets in source code files.
- Do not create `firebase-config.json` or similar config files containing unencrypted keys.
- Do not share API keys or credentials in chat, Slack, or tickets.

✅ **ALWAYS DO THIS:**
- Store secrets in `.env.local` for local development.
- For deployment platforms (Vercel, Cloud Run, Netlify), configure secrets in the Environment Variables dashboard.
- Access secrets exclusively via `import.meta.env` (`VITE_` prefix) or server `process.env`.
- Use the centralized `src/firebase.ts` module for Firebase service initialization.

### Vercel Deployment

For step-by-step instructions on deploying Businesskar to Vercel, refer to **[`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md)**:
- Configuration parameters for `VITE_FIREBASE_*` variables in Vercel project settings
- `vercel.json` rewrite routing rules for client-side navigation
- Firebase Authentication authorized domains configuration

### Pre-Commit Hooks & Automated Scanning

To prevent accidental secret leaks, configure pre-commit hooks locally:
```bash
pip install pre-commit
pre-commit install
```

Automated GitHub Actions secret scanning is active on `main` and `develop` branches via `.github/workflows/secret-scan.yml`.

---

## 🧑‍💼 Personas & Guided Setup Architecture

- **Persona Quick Selector (Step 0)**: Displays 6 taxpayer archetypes (Salaried Consultant, Full-Time Freelancer, Stock Investor, International Freelancer, Small Business Owner, First-Time Filer).
- **Auto-Launch Behavior**: The persona selector is **optional** and only shown when the user explicitly clicks "Guided Setup Wizard" or "Get Started". It never auto-pops on initial page load.
- **Overwrite Safeguard (`ProfileOverwriteModal`)**: When an existing user with customized tax data selects a persona or clicks "Choose Your Persona Again", a 3-option modal is presented:
  1. `Replace with Demo`: Injects sample figures into the active draft while preserving cloud backups.
  2. `Compare Side-by-Side`: Renders a live comparative matrix of active vs demo figures without mutating data.
  3. `Never Mind, Keep My Data`: Cancels the switch without changes.
- **Smart Tab Routing**: Completing the setup routes to the persona's `preferredTab` (e.g. `multi-head-salary-tax` for Salaried Consultants), or restores `lastVisitedTab` if the persona selector was skipped.

---

## 🤖 AI Tax Copilot & Rules-as-Code

- **Hybrid Intelligence**: Powered by Gemini with a 3.5-second timeout and instant fallback to `deterministicCopilot.ts`.
- **Statutory Rules**: Full automatic handling of Indian numeric idioms (`50k` ➔ ₹50,000, `5 lakhs` ➔ ₹5,00,000), Section 56(2)(x) relative gift tax exemptions, Section 80CCD(1B) NPS what-if scenarios, and 1-click profile update triggers.
- **Zero-Canned Fallback Invariant**: The copilot never displays static canned sentences; it executes full Rules-as-Code recalculations locally if offline or under network constraints.
