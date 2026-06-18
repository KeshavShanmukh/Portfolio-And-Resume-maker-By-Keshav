# Developer Quick Walkthrough (Windows PowerShell)

This file walks through the exact steps to run and verify the project stack locally on Windows.

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

Security note about plaintext passwords

- By default passwords are hashed with `bcrypt` before being stored. This is the safe default.
- If you explicitly need plaintext passwords for quick testing (not recommended), set `PLAINTEXT_PASSWORDS=true` in `backend/.env`. This will cause the server to store and compare passwords in plaintext.
- NEVER enable `PLAINTEXT_PASSWORDS=true` on production or on any machine with real user data.

4) Troubleshooting

- CORS errors: ensure backend is running and `cors()` is enabled in `backend/index.js`.
- Wrong token / 401: open DevTools → Application → Local Storage and confirm `token` exists. If not, re-register or login.
- Ports: Backend uses `PORT` from `backend/.env` (default 4000). Frontend expects backend at `http://localhost:4000`.

5) Git

- Branch with work: `day1-setup` (local). To push to GitHub:

```powershell
# add remote then push
git remote add origin <GITHUB_REPO_URL>
git push -u origin day1-setup
```

If you want I can push to a repo you provide.

6) Quick test credentials (for local development)

- Email: `tester_js@example.com`
- Password: `password123`

These credentials are created for testing and the password is bcrypt-hashed in the local SQLite DB. Use them to login via the frontend or with the test scripts in `backend/`.

7) Portfolio persistence

- The Dashboard includes a `Portfolio` editor saved to the backend when authenticated.
- API endpoints:
  - `GET /api/portfolio` — returns the authenticated user's portfolio (or null)
  - `POST /api/portfolio` — creates or updates the authenticated user's portfolio

Test script examples (run from `backend/`):

```powershell
node test_register.js   # registers a test user
node test_login.js      # logs in and prints token
node test_portfolio.js  # posts and fetches portfolio for the test user
```

If you'd like, I can push the `day1-setup` branch to GitHub — provide the repository URL or I can create one for you.
