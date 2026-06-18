# Portfolio Maker

This repository contains the setup for the Portfolio Maker + Resume Builder platform.

Developer quick start

1. Backend

	 - Install and run:

		 ```powershell
		 cd "backend"
		 npm install
		 # copy .env.example to .env and set JWT_SECRET
		 cp .env.example .env
		 npm run dev
		 ```

	 - Tests (from backend folder):

		 ```powershell
		 node test_register.js
		 node test_login.js
		 node test_dashboard.js
		 ```

2. Frontend

	 - Install and run:

		 ```powershell
		 cd "frontend"
		 npm install
		 npm run dev
		 ```

	 - Open the app: `http://localhost:5173/` and use `/register` and `/login`.

3. Notes

	 - Backend `.env.example` contains the SQLite URL and a placeholder `JWT_SECRET`. Replace it.
	 - The frontend uses `localStorage` to store the JWT token and sends it in the `Authorization` header when accessing the protected `/api/dashboard` endpoint.

If you'd like, I can create a GitHub repo and push this branch — share the repo URL or tell me to create one.
