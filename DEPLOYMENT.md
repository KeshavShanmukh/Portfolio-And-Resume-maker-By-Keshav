# Deployment Guide

This guide covers deploying the Portfolio Maker + Resume Builder platform to Render.

## Prerequisites

- GitHub account
- Render account (free tier available)
- OpenAI API key (for AI features)

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_secure_random_string_here"
PORT=4000
OPENAI_API_KEY="your_openai_api_key_here"
PLAINTEXT_PASSWORDS=false
```

**Important:**
- Generate a secure JWT_SECRET using: `openssl rand -base64 32`
- Get your OpenAI API key from https://platform.openai.com/api-keys
- Never commit `.env` files to git

## GitHub Setup

1. **Initialize Git Repository** (if not already done):
   ```bash
   cd "c:\Users\P.KESHAV\Desktop\portfolio maker"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `portfolio-maker`)
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-maker.git
   git branch -M main
   git push -u origin main
   ```

## Render Deployment

### Backend Deployment

1. **Create Web Service**:
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `portfolio-maker-backend`
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npx prisma generate`
     - **Start Command**: `node index.js`
     - **Environment Variables**:
       - `DATABASE_URL`: `file:./prisma/dev.db`
       - `JWT_SECRET`: Your secure random string
       - `OPENAI_API_KEY`: Your OpenAI API key
       - `PORT`: `4000`
       - `PLAINTEXT_PASSWORDS`: `false`

2. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the backend URL (e.g., `https://portfolio-maker-backend.onrender.com`)

### Frontend Deployment

1. **Create Web Service**:
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `portfolio-maker-frontend`
     - **Branch**: `main`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview` (or use Static Site for better performance)
     - **Environment Variables**:
       - `VITE_API_URL`: Your backend URL (e.g., `https://portfolio-maker-backend.onrender.com`)

2. **Alternative: Static Site Deployment** (Recommended):
   - Use Render's Static Site feature
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
     - **Environment Variables**: Same as above

## Update Frontend API URL

After deploying the backend, update the frontend to use the production API URL:

1. **Create `.env` in frontend directory**:
   ```env
   VITE_API_URL=https://portfolio-maker-backend.onrender.com
   ```

2. **Update API calls in frontend**:
   Replace hardcoded `http://localhost:4000` with `import.meta.env.VITE_API_URL`

Example:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const res = await axios.get(`${API_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
```

## Database Considerations

**Note**: SQLite on Render is not persistent across deployments. For production:

1. **Option 1: Use Render PostgreSQL** (Recommended):
   - Update `DATABASE_URL` to Render PostgreSQL connection string
   - Update Prisma schema provider to `postgresql`
   - Run migrations: `npx prisma migrate deploy`

2. **Option 2: Use External Database**:
   - Use Supabase, Neon, or other PostgreSQL provider
   - Update connection string accordingly

## File Storage

For production file storage:

1. **Option 1: Render Disk** (Limited):
   - Files stored in `uploads/` directory
   - Not persistent across deployments
   - Suitable for development only

2. **Option 2: Cloud Storage** (Recommended):
   - AWS S3
   - Cloudinary
   - Upload the file upload routes to use cloud storage

## Testing the Deployment

1. **Backend Health Check**:
   ```bash
   curl https://portfolio-maker-backend.onrender.com/api/dashboard
   ```

2. **Frontend Access**:
   - Open your frontend URL
   - Test registration and login
   - Create a portfolio/resume
   - Test AI features (with valid API key)

## Troubleshooting

### Backend Issues

- **Database Connection**: Check DATABASE_URL format
- **Port Conflicts**: Ensure PORT is set to 4000 or use Render's default
- **Prisma Migrations**: Run `npx prisma migrate deploy` in build command

### Frontend Issues

- **API Connection**: Check VITE_API_URL is correct
- **Build Errors**: Ensure all dependencies are installed
- **CORS Errors**: Verify backend CORS configuration

### Common Errors

- **JWT_SECRET missing**: Add to environment variables
- **OpenAI API errors**: Verify API key is valid
- **File upload failures**: Check multer configuration and storage limits

## Maintenance

### Regular Tasks

1. **Update Dependencies**:
   ```bash
   npm update
   ```

2. **Database Backups**:
   - Regular backups if using PostgreSQL
   - Export SQLite database for local backups

3. **Monitor Logs**:
   - Check Render logs for errors
   - Monitor API usage and costs

### Scaling

- **Backend**: Add more instances in Render settings
- **Database**: Upgrade PostgreSQL plan
- **Frontend**: Use CDN for static assets

## Security Best Practices

1. **Environment Variables**:
   - Never commit secrets to git
   - Rotate JWT_SECRET periodically
   - Use strong, random passwords

2. **API Security**:
   - Rate limiting on public endpoints
   - Input validation on all routes
   - HTTPS only in production

3. **File Uploads**:
   - Validate file types
   - Limit file sizes
   - Scan uploaded files for malware

## Cost Optimization

- **Render Free Tier**: Limited but sufficient for small projects
- **Database**: Use PostgreSQL free tier from Neon/Supabase
- **AI Features**: Monitor OpenAI API usage to control costs
- **CDN**: Use Cloudflare CDN for frontend assets

## Support

For issues:
- Check Render logs
- Review GitHub Issues
- Consult documentation for each service
