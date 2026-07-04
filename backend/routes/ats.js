const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Analyze resume for ATS score
router.post('/analyze', async (req, res) => {
  try {
    const { resumeId } = req.body || {};
    if (!resumeId) return res.status(400).json({ error: 'resumeId is required' });
    
    const rid = parseInt(resumeId, 10);
    const resume = await prisma.resume.findFirst({
      where: { id: rid, userId: req.user.id },
      include: { sections: true }
    });
    
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    // Parse sections
    const sections = resume.sections.map(s => ({ ...s, content: safeParse(s.content) }));
    
    // Calculate ATS score
    const analysis = calculateATSScore(sections);
    
    // Save report
    const report = await prisma.aTSReport.create({
      data: {
        userId: req.user.id,
        resumeId: rid,
        score: analysis.score,
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
        suggestions: JSON.stringify(analysis.suggestions),
        keywords: analysis.keywords ? JSON.stringify(analysis.keywords) : null
      }
    });

    return res.json({
      id: report.id,
      score: analysis.score,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      keywords: analysis.keywords
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get ATS reports for user
router.get('/reports', async (req, res) => {
  try {
    const reports = await prisma.aTSReport.findMany({
      where: { userId: req.user.id },
      include: { resume: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const out = reports.map(r => ({
      ...r,
      strengths: safeParse(r.strengths),
      weaknesses: safeParse(r.weaknesses),
      suggestions: safeParse(r.suggestions),
      keywords: r.keywords ? safeParse(r.keywords) : null
    }));
    
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get specific ATS report
router.get('/report/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const report = await prisma.aTSReport.findFirst({
      where: { id, userId: req.user.id },
      include: { resume: true }
    });
    
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    const out = {
      ...report,
      strengths: safeParse(report.strengths),
      weaknesses: safeParse(report.weaknesses),
      suggestions: safeParse(report.suggestions),
      keywords: report.keywords ? safeParse(report.keywords) : null
    };
    
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

function safeParse(v) {
  try { return JSON.parse(v); } catch (e) { return {}; }
}

function calculateATSScore(sections) {
  let score = 0;
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const keywords = [];

  const sectionTypes = sections.map(s => s.type);
  const contentMap = {};
  sections.forEach(s => { contentMap[s.type] = s.content; });

  // Check for contact information
  const contact = contentMap['contact'] || {};
  if (contact.email && contact.phone) {
    score += 15;
    strengths.push('Contact information is complete');
  } else {
    score += 5;
    weaknesses.push('Contact information is incomplete');
    suggestions.push('Add both email and phone number');
  }

  // Check for professional summary
  const summary = contentMap['summary'] || {};
  if (summary.text && summary.text.length > 50) {
    score += 15;
    strengths.push('Professional summary is present and detailed');
  } else {
    weaknesses.push('Professional summary is missing or too short');
    suggestions.push('Add a professional summary (2-3 sentences)');
  }

  // Check for skills
  const skills = contentMap['skills'] || {};
  if (skills.skills && skills.skills.length >= 5) {
    score += 15;
    strengths.push('Skills section is comprehensive');
    keywords.push(...skills.skills.slice(0, 10));
  } else {
    score += 5;
    weaknesses.push('Skills section needs more skills');
    suggestions.push('Add at least 5-10 relevant skills');
  }

  // Check for experience
  const experience = contentMap['experience'] || {};
  if (experience.items && experience.items.length >= 1) {
    score += 20;
    strengths.push('Work experience is included');
  } else {
    weaknesses.push('Work experience is missing');
    suggestions.push('Add your work experience with details');
  }

  // Check for education
  const education = contentMap['education'] || {};
  if (education.items && education.items.length >= 1) {
    score += 15;
    strengths.push('Education is included');
  } else {
    weaknesses.push('Education section is missing');
    suggestions.push('Add your education details');
  }

  // Check for projects
  const projects = contentMap['projects'] || {};
  if (projects.items && projects.items.length >= 1) {
    score += 10;
    strengths.push('Projects are included');
  } else {
    weaknesses.push('Projects section could improve your profile');
    suggestions.push('Add relevant projects to showcase your skills');
  }

  // Check for certifications
  const certifications = contentMap['certifications'] || {};
  if (certifications.items && certifications.items.length >= 1) {
    score += 10;
    strengths.push('Certifications are included');
  }

  // Check for references
  const references = contentMap['references'] || {};
  if (references.items && references.items.length >= 1) {
    score += 5;
    strengths.push('References are included');
    // Check reference completeness
    const completeRefs = references.items.filter(r => r.name && r.designation && r.email);
    if (completeRefs.length === references.items.length) {
      strengths.push('References are complete with contact information');
    } else {
      suggestions.push('Ensure all references include name, designation, and email');
    }
  } else {
    weaknesses.push('References section is missing');
    suggestions.push('Consider adding professional references (2-3 recommended)');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return { score, strengths, weaknesses, suggestions, keywords };
}

module.exports = router;
