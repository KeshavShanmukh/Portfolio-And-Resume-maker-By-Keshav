const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and ZIP allowed.'));
    }
  }
});

// Upload profile image
router.post('/profile-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = `/uploads/${req.file.filename}`;
    
    // Update user profile image
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: filePath }
    });

    return res.json({ filePath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Upload project image
router.post('/project-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = `/uploads/${req.file.filename}`;
    return res.json({ filePath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Upload and parse PDF resume
router.post('/resume-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    
    // Parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Extract basic information (simple parsing)
    const extractedData = extractResumeData(pdfData.text);
    
    // Save uploaded resume record
    const uploadedResume = await prisma.uploadedResume.create({
      data: {
        userId: req.user.id,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        extractedData: JSON.stringify(extractedData)
      }
    });

    return res.json({
      id: uploadedResume.id,
      fileName: uploadedResume.fileName,
      extractedData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error or PDF parsing failed' });
  }
});

// Upload custom portfolio (HTML/CSS/JS/ZIP)
router.post('/portfolio-code', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filePath = `/uploads/${req.file.filename}`;

    let codeHtml = null;
    let codeCss = null;
    let codeJs = null;

    if (ext === '.zip') {
      // For ZIP files, just return the path for now
      // In production, you'd extract and parse the files
      return res.json({ filePath, type: 'zip' });
    } else if (ext === '.html') {
      codeHtml = fs.readFileSync(path.join(__dirname, '../uploads', req.file.filename), 'utf-8');
    } else if (ext === '.css') {
      codeCss = fs.readFileSync(path.join(__dirname, '../uploads', req.file.filename), 'utf-8');
    } else if (ext === '.js') {
      codeJs = fs.readFileSync(path.join(__dirname, '../uploads', req.file.filename), 'utf-8');
    }

    return res.json({ filePath, codeHtml, codeCss, codeJs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

function extractResumeData(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const data = {
    name: '',
    email: '',
    phone: '',
    skills: [],
    education: [],
    experience: [],
    projects: []
  };

  // Simple email extraction
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) data.email = emailMatch[0];

  // Simple phone extraction
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  if (phoneMatch) data.phone = phoneMatch[0];

  // Extract name (usually first non-empty line)
  if (lines.length > 0) data.name = lines[0];

  // Look for common section headers
  const skillsIndex = lines.findIndex(l => /skills/i.test(l));
  const educationIndex = lines.findIndex(l => /education/i.test(l));
  const experienceIndex = lines.findIndex(l => /experience|work/i.test(l));
  const projectsIndex = lines.findIndex(l => /projects/i.test(l));

  // Extract skills
  if (skillsIndex !== -1) {
    const nextSection = [educationIndex, experienceIndex, projectsIndex]
      .filter(i => i > skillsIndex)
      .sort((a, b) => a - b)[0] || lines.length;
    
    const skillsText = lines.slice(skillsIndex + 1, nextSection).join(' ');
    data.skills = skillsText.split(/[,\n•]/).map(s => s.trim()).filter(s => s.length > 2);
  }

  // Extract education
  if (educationIndex !== -1) {
    const nextSection = [experienceIndex, projectsIndex]
      .filter(i => i > educationIndex)
      .sort((a, b) => a - b)[0] || lines.length;
    
    data.education = lines.slice(educationIndex + 1, nextSection)
      .filter(l => l.length > 5)
      .slice(0, 3);
  }

  // Extract experience
  if (experienceIndex !== -1) {
    const nextSection = projectsIndex > experienceIndex ? projectsIndex : lines.length;
    data.experience = lines.slice(experienceIndex + 1, nextSection)
      .filter(l => l.length > 5)
      .slice(0, 5);
  }

  return data;
}

module.exports = router;
