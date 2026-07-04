require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);

app.post('/api/portfolio/:slug/contact', async (req, res) => {
  try {
    const { slug } = req.params;
    const { visitorName, visitorEmail, messageText } = req.body || {};

    if (!slug || !visitorName || !visitorEmail || !messageText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { customSlug: slug },
      select: { userId: true }
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const message = await prisma.contactMessage.create({
      data: {
        portfolioOwnerId: portfolio.userId,
        visitorName,
        visitorEmail,
        messageText
      }
    });

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/resume', authMiddleware, resumeRoutes);
app.use('/api/ats', authMiddleware, atsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Public routes (no auth required)
app.use('/', publicRoutes);

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  return res.json({ message: 'Protected dashboard', userId: req.user.id });
});

app.get('/api/dashboard/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: { portfolioOwnerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
