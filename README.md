# Portfolio Maker + Resume Builder Platform

A complete SaaS-style platform for creating portfolios and resumes with AI assistance, ATS scoring, and free publishing.

## Features

- **Portfolio Builder**: Three creation methods (Form, Drag & Drop, Code Builder)
- **Resume Builder**: Professional resume builder with multiple sections
- **PDF Import**: Parse existing resumes from PDF files
- **ATS Scoring**: Analyze resumes for ATS optimization
- **AI Assistant**: OpenAI-powered content generation and improvement
- **Free Publishing**: Share portfolios and resumes publicly
- **Dark/Light Mode**: Modern UI with theme toggle
- **Profile Management**: User settings and profile customization
- **Template System**: 5 pre-built portfolio templates and 6 resume templates

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- dnd-kit (Drag & Drop)
- Monaco Editor

### Backend
- Node.js
- Express.js
- SQLite + Prisma ORM
- JWT Authentication
- Multer (File Uploads)
- pdf-parse (PDF Parsing)
- OpenAI API

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```powershell
cd "backend"
npm install
# Copy .env.example to .env and configure
cp .env.example .env
# Set your JWT_SECRET and OPENAI_API_KEY in .env
npm run dev
```

Backend runs on `http://localhost:4000`

### Frontend Setup

```powershell
cd "frontend"
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_secure_random_string"
PORT=4000
OPENAI_API_KEY="your_openai_api_key"
PLAINTEXT_PASSWORDS=false
```

**Frontend (.env)**:
```env
VITE_API_URL="http://localhost:4000"
```

## Usage

1. **Register**: Create an account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: Access all features from the dashboard
4. **Create Portfolio**: Choose from Form, Drag & Drop, or Code Builder
5. **Create Resume**: Build professional resumes with multiple sections
6. **Import PDF**: Upload existing resumes to auto-fill data
7. **ATS Scoring**: Analyze and improve your resume
8. **AI Assistant**: Get help with content generation
9. **Publish**: Share your portfolio/resume publicly

## Project Structure

```
portfolio-maker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── auth.js
│   │   ├── portfolio.js
│   │   ├── resume.js
│   │   ├── ats.js
│   │   ├── ai.js
│   │   ├── upload.js
│   │   └── public.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── index.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── portfolio/
│   │   ├── resume/
│   │   ├── contexts/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── DEPLOYMENT.md
```

## Database Models

- **User**: Authentication and profile
- **Portfolio**: Portfolio data with sections
- **Resume**: Resume data with sections
- **ATSReport**: ATS analysis results
- **UploadedResume**: PDF upload records
- **AIHistory**: AI interaction history

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Portfolio
- `POST /api/portfolio/create` - Create portfolio
- `GET /api/portfolio` - List portfolios
- `GET /api/portfolio/:id` - Get portfolio
- `PUT /api/portfolio/:id` - Update portfolio
- `DELETE /api/portfolio/:id` - Delete portfolio
- `POST /api/portfolio/section` - Create section
- `PUT /api/portfolio/section/:id` - Update section
- `DELETE /api/portfolio/section/:id` - Delete section

### Resume
- `POST /api/resume/create` - Create resume
- `GET /api/resume` - List resumes
- `GET /api/resume/:id` - Get resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/section` - Create section
- `PUT /api/resume/section/:id` - Update section
- `DELETE /api/resume/section/:id` - Delete section

### ATS Scoring
- `POST /api/ats/analyze` - Analyze resume
- `GET /api/ats/reports` - Get reports
- `GET /api/ats/report/:id` - Get specific report

### AI Assistant
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/generate-summary` - Generate summary
- `POST /api/ai/improve-content` - Improve content
- `POST /api/ai/suggest-skills` - Suggest skills
- `GET /api/ai/history` - Get AI history

### Upload
- `POST /api/upload/profile-image` - Upload profile image
- `POST /api/upload/project-image` - Upload project image
- `POST /api/upload/resume-pdf` - Upload and parse PDF
- `POST /api/upload/portfolio-code` - Upload portfolio code

### Public
- `GET /u/:username` - Public portfolio view
- `GET /u/:username/resume` - Public resume view

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Render.

## Development

### Running Tests

```powershell
cd backend
node test_register.js
node test_login.js
node test_dashboard.js
```

### Database Migrations

```powershell
cd backend
npx prisma migrate dev
npx prisma studio
```

### Building for Production

```powershell
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.
