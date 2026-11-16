# OpsChimp Storefront Demo (Netlify Edge Functions)

A modern, serverless reference frontend demonstrating how to integrate external websites and quote funnels with the **OpsChimp Client Storefront API**.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Netlify Edge Functions**.

---

## 🌟 Key Features

1. **Strict Server-to-Server Security**:
   - The public browser client never sees or stores your OpsChimp Bearer Token.
   - All API requests are proxied via a **Netlify Edge Function** (`netlify/edge-functions/api-proxy.ts`), which injects `Authorization: Bearer <TOKEN>` on the edge.
2. **Interactive Developer Sandbox**:
   - Includes an in-app "API Settings" drawer to test with different tenant tokens or local servers on the fly via temporary session headers.
3. **Multi-Zone Surface Calculations**:
   - Uses OpsChimp's surface structure: separates active lawn grass areas from hard surfaces (driveways, patios) to ensure accurate treatment rate brackets.
4. **Campaign Studio & Add-on Bundles**:
   - Automatically renders promotional badges (e.g. `Spring Promo`), taglines, and bulleted selling points directly from your Campaign Studio configuration.
   - Renders 1-click checkout add-on bundles with 10% discount calculations and monthly addition badges.
5. **Instant Chimp Pay Card Setup**:
   - Transitions quote to `approved`, pre-configures seasonal service treatments, and redirects to the tokenized Chimp Pay Card Setup session.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your local or staging values:
```env
OPSCHIMP_BASE_URL=http://localhost:8080/api/v1/client
OPSCHIMP_API_KEY=your_tenant_bearer_token_here
```

### 3. Run Dev Server
```bash
npm run dev
```
Open `http://localhost:5174` in your browser. The Vite dev server proxies `/api/*` directly to OpsChimp with your configured Bearer token.

---

## 🌐 Deploy to Netlify

### One-Click GitHub Deploy
1. Push this repository to GitHub.
2. In Netlify, click **"Add new site" > "Import an existing project" > GitHub**.
3. Select your repository.
4. Under **Site configuration > Environment variables**, add:
   - `OPSCHIMP_BASE_URL`: `https://app.opschimp.com/api/v1/client` (or your live domain)
   - `OPSCHIMP_API_KEY`: Your tenant's Bearer API Token (from OpsChimp *Settings > Developer API & Integrations*).
5. Click **Deploy Site**. Netlify will automatically build the Vite app and register the edge function on `/api/*`.

---

## 📁 Project Structure

```
opschimp-storefront-demo/
├── netlify/
│   └── edge-functions/
│       └── api-proxy.ts     # Edge proxy injecting Bearer token server-to-server
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Storefront branding & Sandbox button
│   │   ├── SandboxDrawer.tsx    # Slide-out developer testing drawer
│   │   ├── StepLead.tsx         # Step 1: Customer contact & address
│   │   ├── StepMeasurements.tsx # Step 2: Multi-zone lawn sizing
│   │   ├── StepPackages.tsx     # Step 3: Package comparison & add-ons
│   │   └── StepCheckout.tsx     # Step 4: Terms & Chimp Pay Card Setup
│   ├── services/
│   │   └── api.ts               # Clean browser API client
│   ├── types/
│   │   └── opschimp.ts          # TypeScript interfaces for OpsChimp API
│   ├── App.tsx                  # Main Stepper workflow
│   ├── main.tsx
│   └── index.css                # Tailwind directives
├── netlify.toml                 # Netlify build & edge function routing
├── vite.config.ts               # Vite bundler & local dev server proxy
└── package.json
```
