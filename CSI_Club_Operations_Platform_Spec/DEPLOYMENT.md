# Deployment Guide: Vercel & Standalone Cloud Architecture

The CSI Club Operations Platform is a **100% standalone system** built for instant deployment on **Vercel** with **zero external blockers** (no Docker, no Notion tokens, and no server configuration).

---

## 🚀 1. Frontend Deployment (Vercel)

### Architecture
* **Frontend:** Responsive single-page application served via Vercel's global Edge CDN.
* **Access Model:** You (Admin) manage the code; your 4 team members open the generated link (`https://your-csi-app.vercel.app`) in any browser.
* **Zero Dependencies:** Runs out of the box with zero external tokens.

### Deployment Steps (Takes Under 60 Seconds)
1. **Push your repository to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete standalone operations platform"
   git push origin main
   ```
2. **Import to Vercel**:
   * Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   * Select your GitHub repository (`CSI_Club_Operations_Platform`).
   * Framework Preset: **Other** / Static.
   * Root Directory: `./` (Vercel detects `vercel.json` and serves `public/`).
3. *(Optional)* **Add Supabase Environment Variables** (if using live cloud PostgreSQL):
   * `SUPABASE_URL`: Your project URL.
   * `SUPABASE_ANON_KEY`: Your project public anon key.
4. Click **Deploy**. Your live website URL is generated immediately!

---

## 🗄️ 2. Database (Supabase Cloud - Optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Paste the SQL script from [`supabase/schema.sql`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/supabase/schema.sql) into the **SQL Editor** and run it.
3. Your database is now initialized with ACID compliance and Row-Level Security.

---

## 🐍 3. Python Microservice (Optional for Certificate Batch API)

If hosting the Python engine (`python/server.py`) for live API calls:
* Deploy to [Render](https://render.com) or [Railway](https://railway.app) connected to the same GitHub repository.
* Start Command: `uvicorn python.server:app --host 0.0.0.0 --port $PORT`
* No Docker needed—Render automatically builds the Python environment.

---

## 👥 4. Team Member Workflow

* **You (Operations Lead / Administrator):**
  * Push updates to GitHub and control the Vercel project.
* **Your 4 Team Members:**
  * Open the Vercel URL on their laptop or mobile phone.
  * Use the **Certificate Validator** (drag & drop up to 400 certificates).
  * Use the **Coordinator Allocation Studio** (generate balanced rosters).
  * Browse the **Events & Members Directories**.
  * **Zero installation, zero local server setup, and zero permissions needed.**
