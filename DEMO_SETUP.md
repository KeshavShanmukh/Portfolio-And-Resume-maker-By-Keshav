# 🚀 Demo Setup Guide

This guide will help you set up and run the demo environment for the Portfolio & Resume Maker application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (included with Node.js)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Environment Variables

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env and set your database URL and other configurations

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env and set your API URL
```

### 3. Initialize Database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Demo Data

```bash
cd backend
npm run seed:demo
```

This will create:
- **2 users**: admin (password: admin123) and demo (password: demo123)
- **3 portfolios**: Developer, Student, and Creative portfolios with sample data
- **3 resumes**: ATS, Student, and Professional resumes with complete information
- **1 ATS report**: Sample analysis report
- **PDF records**: Sample uploaded and generated PDF records

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173 (or the port shown in your terminal)
- **Backend API**: http://localhost:4000

## 🔑 Demo Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Demo User | demo | demo123 |

## 🎯 What You Can Test

### As Demo User (demo/demo123):

1. **Dashboard**
   - View all portfolios and resumes
   - See statistics and quick actions

2. **Portfolio Builder**
   - Create new portfolios
   - Edit existing demo portfolios
   - Use Form Builder or Drag & Drop
   - Preview changes in real-time

3. **Resume Builder**
   - Create new resumes
   - Edit existing demo resumes
   - Add/edit all sections including References
   - Live preview with all sections

4. **ATS Scoring**
   - Analyze resumes for ATS compatibility
   - View detailed reports with suggestions

5. **Published Portfolios**
   - View published portfolio pages
   - Test different themes and layouts

### As Admin (admin/admin123):

1. **Admin Dashboard**
   - View all users
   - See portfolio and resume statistics
   - Manage published content

2. **User Management**
   - View user list
   - Monitor activity

## 📊 Demo Data Overview

### Portfolios

1. **Developer Portfolio** (John Developer)
   - Hero, About, Skills, Projects (2), Experience, Education, Certifications, Testimonials, Contact
   - Theme: Developer
   - Builder: Drag & Drop

2. **Student Portfolio** (Emily Student)
   - Hero, About, Skills, Projects, Education, Certifications, Contact
   - Theme: Student
   - Builder: Form

3. **Creative Portfolio** (Alex Creative)
   - Hero, About, Skills, Services, Projects, Testimonials, Contact
   - Theme: Creative
   - Builder: Drag & Drop

### Resumes

1. **ATS Resume** (John Developer)
   - Complete with all sections including References
   - ATS Score: 95/100
   - Theme: ATS

2. **Student Resume** (Emily Student)
   - Education-focused with projects and internships
   - Theme: Student

3. **Professional Resume** (Sarah Professional)
   - Senior-level with extensive experience
   - Theme: Professional

## 🛠️ Testing Workflows

### Portfolio Workflow
1. Login as demo user
2. Go to Dashboard → My Portfolios
3. Click "Edit" on any portfolio
4. Try both Form Builder and Drag & Drop
5. Add/edit sections
6. Preview changes
7. Publish/unpublish

### Resume Workflow
1. Login as demo user
2. Go to Dashboard → My Resumes
3. Click "Edit" on any resume
4. Add/edit sections including References
5. Use live preview
6. Run ATS analysis
7. Publish/unpublish

### ATS Analysis Workflow
1. Login as demo user
2. Go to ATS Scoring page
3. Select a resume
4. Click "Analyze"
5. View detailed report with score, strengths, weaknesses, and suggestions

## 🎨 Features Demonstrated

### Portfolio Features
- ✅ Hero section with name, role, tagline, image
- ✅ About section with description
- ✅ Skills section with skill levels
- ✅ Projects section with GitHub/Live links
- ✅ Education section with description
- ✅ Experience section with description
- ✅ Certifications with credential URLs
- ✅ Achievements section
- ✅ Testimonials section
- ✅ Services section with icons
- ✅ Gallery section
- ✅ Blogs section
- ✅ Social Links section
- ✅ Contact section
- ✅ Custom sections support

### Resume Features
- ✅ Contact information (name, email, phone, location, LinkedIn, GitHub)
- ✅ Professional Summary
- ✅ Skills (comma-separated)
- ✅ Experience with multiple entries
- ✅ Education with GPA and relevant coursework
- ✅ Projects with technologies
- ✅ Certifications
- ✅ Languages
- ✅ Interests
- ✅ **References** (NEW!) with full contact details

### ATS Features
- ✅ Resume scoring (0-100)
- ✅ Strengths identification
- ✅ Weaknesses detection
- ✅ Improvement suggestions
- ✅ Keyword extraction
- ✅ References completeness check

## 🔄 Resetting Demo Data

If you want to reset the demo data:

```bash
cd backend
npx prisma migrate reset  # Reset database
npm run seed:demo         # Re-seed demo data
```

## 📝 Notes

- The demo data is designed to showcase all features of the application
- All sample data uses placeholder images and links
- The demo mode does not affect production users
- You can create additional users and content while testing

## 🐛 Troubleshooting

### Database Errors
```bash
cd backend
rm prisma/dev.db  # Delete database file
npx prisma migrate dev  # Recreate database
npm run seed:demo  # Re-seed data
```

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
# Windows: netstat -ano | findstr :4000
# Mac/Linux: lsof -ti:4000 | xargs kill

# Kill process on port 5173 (frontend)
# Windows: netstat -ano | findstr :5173
# Mac/Linux: lsof -ti:5173 | xargs kill
```

### Node Modules Issues
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your .env files are correctly configured
3. Ensure all dependencies are installed
4. Try resetting the database and re-seeding

---

**Happy Testing! 🎉**