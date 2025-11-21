# Walkthrough – Deploy‑ready changes

## What was fixed

1. **Static frontend serving in production**
   - Added a `if (process.env.NODE_ENV === "production")` block in `backend/server.js` that serves the built Vite files from `backend/public` and provides an SPA fallback (`index.html`).
2. **API URLs are now relative**
   - Updated every frontend API file (`auth.js`, `upload.js`, `quiz.js`, `goals.js`, `recommendations.js`) to use `const BASE_URL = "/api/..."` instead of the hard‑coded `http://localhost:3000`.
3. **CORS whitelist** now includes a dynamic `process.env.FRONTEND_URL` so Render can send the correct origin, while still allowing the local dev origins.
4. **Vite dev‑server proxy**
   - Added a proxy configuration in `frontend/vite.config.js` that forwards any request starting with `/api` to `http://localhost:3000`. This makes the relative API URLs work locally without CORS errors.
5. **Build script**
   - The root `package.json` already builds the Vite app, copies the `dist` folder into `backend/public`, and installs backend dependencies.

## How to verify locally

```bash
# 1️⃣ Start the backend (port 3000)
cd backend
node server.js

# 2️⃣ Start the Vite dev server (port 5173)
cd ../frontend
npm run dev
```
- Open `http://localhost:5173`.
- All API calls (login, signup, upload, quiz, goals, recommendations) should work. The network tab will show `/api/...` requests being proxied to `localhost:3000`.
- No "Unexpected end of JSON" errors.

## Deploying to Render (single‑service)

1. **Commit the changes**
   ```bash
   git add .
   git commit -m "Render‑ready: static serving, relative API URLs, dev proxy"
   git push origin main
   ```
2. **Render configuration**
   - In the Render dashboard, create a **Web Service** (Node environment) that points to this repository.
   - Set the **Build Command** to `npm run build` (the root script already does the Vite build and copies files).
   - Set the **Start Command** to `npm start` (runs `cd backend && node server.js`).
   - Add environment variables:
     - `FRONTEND_URL=${RENDER_EXTERNAL_URL}` (Render will substitute the actual URL).
     - `NODE_ENV=production` (Render sets this automatically, but you can add it for clarity).
     - Any other secrets you already use (`MONGO_URI`, `SESSION_SECRET`).
3. **Trigger a deploy** (Render will automatically start a new build after the push).
4. **Test the live URL**
   - Visit the URL Render gives you (e.g. `https://my‑app.onrender.com`).
   - The UI should load, and all API actions should work because the same Express process now serves both the API and the static files.

## Optional: Run the production build locally

To make sure the production bundle works before pushing:
```bash
# From the repo root
npm run build   # builds Vite and copies to backend/public
cd backend
node server.js   # now serves the built UI on http://localhost:3000
```
Open `http://localhost:3000` – you should see the same app, but now the UI is served by Express instead of Vite.

## Next steps / what to do now
- ✅ Verify the app works locally in both dev (`npm run dev`) **and** production (`node server.js` after `npm run build`).
- ✅ Push the changes and let Render deploy.
- ✅ If you have a custom domain, add it in Render’s **Custom Domains** section and point your DNS to the Render endpoint.
- ✅ Monitor the Render logs for any runtime errors; the logs will show the same console output you see locally.
- ✅ (Optional) Add a GitHub Action to automatically run `npm test` or lint on each PR.

---
*All changes are now Render‑ready while still fully functional on your local machine.*
