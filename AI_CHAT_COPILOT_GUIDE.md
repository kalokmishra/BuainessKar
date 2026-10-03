# 🤖 Businesskar AI Tax Chat Copilot Architecture & Numerical Pre-processing Guide

This document explains the technical architecture, model details, billing/cost structure, numerical idiom pre-processing pipeline, and statutory intelligence governing the **AI Tax Chat Copilot** in Businesskar.

---

## 1. ❓ Key Architectural Questions Answered

### Q1: How does this AI Chat Panel work?
The AI Chat Copilot is a hybrid intelligence system combining:
1. **Frontend Interface (`/src/components/AIChatPanel.tsx`)**:
   - Accessible via the floating bottom-right launcher button or the top navigation header.
   - Automatically synchronizes with the active user profile and tax state (`TaxDataContext`), including Gross Receipts, Cash Receipts %, Salary, Capital Gains, and Section 80C/80D/80CCD deductions.
   - Dispatches requests to the server-side API endpoint `POST /api/tax/chat`.
   - Renders interactive **What-If Scenario Cards**, **Proposed Profile Updates Cards** with 1-click apply, and **Numerical Idiom Normalization Badges**.
2. **Backend Server-Side Proxy (`/server.ts` & `/src/engine/aiChatCopilot.ts`)**:
   - Securely receives chat payloads without exposing API keys to the browser client.
   - Executes **STEP 0: Indian Numerical Idioms Pre-processing** to normalize conversational financial numbers before processing.
   - Runs `computeBaselineTax` using the application's verified multi-head comprehensive tax engine.
   - Injects the taxpayer's live financial metrics and statutory rules into the system prompt.
   - Communicates with Google's Gemini API using the modern `@google/genai` TypeScript SDK.
   - Returns a structured JSON schema response (`AIChatCopilotResponse`).
   - If in an offline environment, test environment, or if no API key is configured, it falls back seamlessly to the built-in deterministic rule engine (`generateDeterministicChatResponse`).

---

### Q2: Which LLM model is being used?
- **Model**: `gemini-3.8-flash` (Google Gemini 3.8 Flash).
- **SDK**: `@google/genai` (official Google Gen AI TypeScript SDK).
- **Configuration**:
  - `responseMimeType: 'application/json'`
  - Structured response schema enforcing crisp markdown advice, intent categorization, suggested field updates, what-if comparison metrics, and preprocessed entities.
  - Temperature: `0.2` (deterministic, statutory precision).

---

### Q3: Who pays for the model?
- **Zero Cost to End Users**: End users of the application are **never charged** for interacting with the AI Tax Chat Copilot. Users do not need to provide their own API key, credit card, or pay per prompt.
- **Server-Side API Provisioning**: The backend uses the platform environment variable `process.env.GEMINI_API_KEY` (configured via Google AI Studio Build environment / developer credentials).
- **Graceful Deterministic Fallback**: Even without an external API key or in an offline environment, the system runs with 100% functionality via `generateDeterministicChatResponse`. All tax formulas, What-If comparisons, and entry additions compute locally at zero external cost.

---

### Q4: Why did "i received 50k from my mother" previously get misunderstood as ₹50?
When raw LLM models or naive regexes process colloquial inputs:
1. The shorthand `"50k"` can be improperly parsed by standard parsers or general-purpose models as the integer `"50"` (ignoring the `"k"` multiplier), resulting in ₹50 instead of ₹50,000.
2. In addition, general models without statutory tax context may mistakenly add that money to the user's business turnover or treat it as taxable freelancing revenue.

#### The Permanent Solution Implemented:
1. **Mandatory Pre-processing Pipeline (`/src/engine/indianNumberIdioms.ts`)**:
   - All user input messages pass through `preprocessIndianNumericalIdioms()` **before** any calculation or LLM prompt generation.
   - Explicitly maps Indian numerical idioms:
     - `50k`, `50 k`, `50K`, `50 hazar`, `50 thousand` ➔ **`50,000`** (₹50,000)
     - `5 lakhs`, `5L`, `5 lac`, `5 lacs` ➔ **`5,00,000`** (₹5,00,000)
     - `1.5L`, `1.5 lakh`, `1.5 lacs` ➔ **`1,50,000`** (₹1,50,000)
     - `2cr`, `2 cr`, `2 crore`, `2.5 crores` ➔ **`2,00,00,000`** / **`2,50,00,000`**
     - Phrasal forms (`fifty thousand`, `five lakhs`, `two crore`) ➔ Exact integers.
2. **Explicit System Prompt STEP 0 Injection**:
   - The system instruction injects a markdown mapping table of all detected idioms in the current query.
   - Enforces the absolute rule: *"50k means Fifty Thousand Rupees (₹50,000). It is NEVER 50 rupees!"*
3. **Statutory Exemption for Family Gifts (Section 56(2)(x))**:
   - When a user reports receiving money from their **mother**, father, spouse, siblings, or lineal relatives, the engine recognizes that under Section 56(2)(x) of the Income Tax Act, **gifts from relatives are 100% tax-free without any monetary ceiling**.
   - The Copilot explicitly explains that the ₹50,000 is non-taxable, adds **₹0 tax**, and prevents the amount from being wrongfully added to business turnover.

---

## 2. 🔄 Numerical Pre-Processing Pipeline Data Flow

```
                      [ User Message: "i received 50k from my mother" ]
                                             │
                                             ▼
                 ┌────────────────────────────────────────────────────────┐
                 │     /src/engine/indianNumberIdioms.ts                  │
                 │     • extractIndianNumericalEntities()                 │
                 │     • determineStatutoryContext()                      │
                 │                                                        │
                 │  Result:                                               │
                 │  - originalIdiom: "50k"                                │
                 │  - normalizedInteger: 50,000                           │
                 │  - formattedINR: "₹50,000"                             │
                 │  - context: "RELATIVE_GIFT_EXEMPT"                     │
                 │  - Section 56(2)(x) flag: true                         │
                 └───────────────────────────┬────────────────────────────┘
                                             │
                                             ▼
                 ┌────────────────────────────────────────────────────────┐
                 │     /src/engine/aiChatCopilot.ts                       │
                 │     STEP 0: Injects Pre-Processed Mapping Table        │
                 │     into System Instruction & User Message Parts       │
                 └───────────────────────────┬────────────────────────────┘
                                             │
                       ┌─────────────────────┴──────────────────────┐
                       │                                            │
                       ▼ (If API Key Present)                       ▼ (Offline / Fallback)
         ┌───────────────────────────────┐            ┌───────────────────────────────┐
         │ Gemini 3.8 Flash LLM          │            │ Deterministic Rule Engine     │
         │ - Strict schema output        │            │ - Immediate statutory reply   │
         │ - Reassurance on Sec 56(2)(x) │            │ - Zero tax added              │
         │ - Returns preprocessedEntities│            │ - No business turnover hike   │
         └─────────────┬─────────────────┘            └──────────────┬────────────────┘
                       │                                             │
                       └─────────────────────┬───────────────────────┘
                                             │
                                             ▼
                 ┌────────────────────────────────────────────────────────┐
                 │     Frontend UI: AIChatPanel.tsx                       │
                 │     • Renders formatted statutory advice               │
                 │     • Displays "Normalized: 50k ➔ ₹50,000" chip       │
                 │     • Retains active business turnover & tax liability │
                 └────────────────────────────────────────────────────────┘
```

---

## 3. 🧪 Automated Test Verification

All edge cases, numerical idiom combinations, and statutory exemptions are validated by Vitest unit tests in `/tests/aiChatCopilot.test.ts`.

Run the full test suite:
```bash
npm test
```

Expected result:
```
✓ tests/aiChatCopilot.test.ts (11 tests)
  - correctly calculates baseline tax metrics from user profile
  - Indian Numerical Idioms Pre-processing Module
    - normalizes "50k", "50 k", and "50 hazar" to exact integer 50,000 (NOT 50)
    - normalizes "5 lakhs", "5L", and "1.5L" to precise integer values
    - normalizes "2cr" and "2.5 crore" to precise integer values
    - normalizes phrasal number idioms like "fifty thousand" and "five lakhs"
    - generates structured Markdown mapping table for system prompt injection
  - Chat Copilot Intent Handling & Statutory Rules
    - handles "i received 50k from my mother" with pre-processed precision and Section 56(2)(x) exemption
    - handles What-If analysis for Section 80CCD(1B) NPS contribution using "50k"
    - assists user in adding a new client invoice of "5 lakhs"
    - provides Old vs New tax regime comparison and identifies savings
    - runs processAIChatCopilot end-to-end and returns complete copilot response with preprocessedEntities

Test Files: 10 passed (10)
Tests:      42 passed (42)
```
