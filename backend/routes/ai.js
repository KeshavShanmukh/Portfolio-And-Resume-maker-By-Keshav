const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

// AI chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are an expert resume and portfolio builder assistant. Help users improve their resumes and portfolios with professional, impactful content. Provide specific, actionable suggestions.`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    if (context) {
      messages.splice(1, 0, { role: 'assistant', content: context });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    // Save to history
    await prisma.aIHistory.create({
      data: {
        userId: req.user.id,
        prompt,
        response,
        context: context || null
      }
    });

    return res.json({ response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error or AI service unavailable' });
  }
});

// Generate professional summary
router.post('/generate-summary', async (req, res) => {
  try {
    const { skills, experience, role } = req.body || {};
    if (!skills && !experience) return res.status(400).json({ error: 'Skills or experience required' });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate a professional summary for a ${role || 'professional'} with the following skills: ${skills || 'various'} and experience: ${experience || 'multiple years'}. Keep it concise (2-3 sentences) and impactful.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    const summary = completion.choices[0]?.message?.content || '';

    return res.json({ summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error or AI service unavailable' });
  }
});

// Improve content
router.post('/improve-content', async (req, res) => {
  try {
    const { content, type } = req.body || {};
    if (!content) return res.status(400).json({ error: 'Content is required' });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let prompt = '';
    switch (type) {
      case 'project':
        prompt = `Improve this project description to make it more impactful and professional. Focus on achievements and results: ${content}`;
        break;
      case 'experience':
        prompt = `Improve this work experience description to highlight achievements and impact. Use action verbs: ${content}`;
        break;
      case 'about':
        prompt = `Improve this about me section to be more engaging and professional: ${content}`;
        break;
      default:
        prompt = `Improve this content to make it more professional and impactful: ${content}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    });

    const improved = completion.choices[0]?.message?.content || content;

    return res.json({ improved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error or AI service unavailable' });
  }
});

// Suggest skills
router.post('/suggest-skills', async (req, res) => {
  try {
    const { role, industry } = req.body || {};
    if (!role) return res.status(400).json({ error: 'Role is required' });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Suggest 10-15 relevant skills for a ${role} position${industry ? ` in the ${industry} industry` : ''}. Return as a comma-separated list.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    const skillsText = completion.choices[0]?.message?.content || '';
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    return res.json({ skills });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error or AI service unavailable' });
  }
});

// Get AI history
router.get('/history', async (req, res) => {
  try {
    const history = await prisma.aIHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
