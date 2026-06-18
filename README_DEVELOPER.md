# Developer Quick Walkthrough (Windows PowerShell)

This file walks through the exact steps to run and verify the Day 1 stack locally on Windows.

1) Backend — install, configure, run

```powershell
cd "c:/Users/P.KESHAV/Desktop/portfolio maker/backend"
npm install
# Copy env example to .env (PowerShell)
Copy-Item .env.example .env
# Edit .env to set a secure JWT_SECRET (open with notepad or VS Code)
notepad .env

# Start backend (nodemon will reload on changes)
npm run dev
```

Expected: Server logs `Server running on port 4000` and endpoints available at `http://localhost:4000`.

2) Frontend — install and run

```powershell
cd "c:/Users/P.KESHAV/Desktop/portfolio maker/frontend"
npm install
npm run dev
```

Expected: Vite serves the app at `http://localhost:5173/`.

3) Browser test walkthrough (Register → Login → Dashboard)

- Open http://localhost:5173/ in your browser.
- Click `Register` or go to `/register`.
- Fill `Username`, `Email`, `Password`, then click `Register`.
  - On success the app stores a JWT in `localStorage` under `token`.
  - To inspect: open DevTools → Application → Local Storage → `http://localhost:5173`.
- Go to `/login`, enter your credentials and submit.
  - On success you'll be redirected to `/dashboard` which makes a protected call to `http://localhost:4000/api/dashboard` with `Authorization: Bearer <token>`.
  - The dashboard should show `{ "message": "Protected dashboard", "userId": <id> }`.

4) Troubleshooting

- CORS errors: ensure backend is running and `cors()` is enabled in `backend/index.js`.
- Wrong token / 401: open DevTools → Application → Local Storage and confirm `token` exists. If not, re-register or login.
- Ports: Backend uses `PORT` from `backend/.env` (default 4000). Frontend expects backend at `http://localhost:4000`.

5) Git

- Branch with Day 1 work: `day1-setup` (local). To push to GitHub:

```powershell
# add remote then push
git remote add origin <GITHUB_REPO_URL>
git push -u origin day1-setup
```

If you want I can push to a repo you provide.
