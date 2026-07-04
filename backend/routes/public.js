const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Public portfolio view by username
router.get('/u/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        portfolios: {
          where: { isPublished: true },
          include: { sections: { orderBy: { position: 'asc' } } },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.portfolios.length === 0) return res.status(404).json({ error: 'No published portfolio found' });

    const portfolio = user.portfolios[0];
    const out = {
      ...portfolio,
      meta: portfolio.meta ? JSON.parse(portfolio.meta) : null,
      sections: portfolio.sections.map(s => ({ ...s, content: JSON.parse(s.content) }))
    };

    return res.json({
      user: {
        username: user.username,
        profileImage: user.profileImage
      },
      portfolio: out
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Public resume view by username
router.get('/u/:username/resume', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        resumes: {
          where: { isPublished: true },
          include: { sections: { orderBy: { position: 'asc' } } },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.resumes.length === 0) return res.status(404).json({ error: 'No published resume found' });

    const resume = user.resumes[0];
    const out = {
      ...resume,
      meta: resume.meta ? JSON.parse(resume.meta) : null,
      sections: resume.sections.map(s => ({ ...s, content: JSON.parse(s.content) }))
    };

    return res.json({
      user: {
        username: user.username,
        profileImage: user.profileImage
      },
      resume: out
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

module.exports = router;
