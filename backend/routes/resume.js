const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create resume
router.post('/create', async (req, res) => {
  try {
    const { title, builderType, theme, isPublished, meta } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const r = await prisma.resume.create({
      data: {
        userId: req.user.id,
        title,
        builderType: builderType || 'FORM',
        meta: meta ? JSON.stringify(meta) : null,
        theme: theme || 'default',
        isPublished: !!isPublished
      }
    });
    return res.json(r);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List user's resumes
router.get('/', async (req, res) => {
  try {
    const list = await prisma.resume.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get resume by id with sections
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const r = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
      include: { sections: { orderBy: { position: 'asc' } } }
    });
    if (!r) return res.status(404).json({ error: 'Not found' });
    const out = { ...r, meta: r.meta ? JSON.parse(r.meta) : null };
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update resume
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const existing = await prisma.resume.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { title, theme, isPublished, builderType, meta } = req.body || {};
    const updated = await prisma.resume.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        builderType: builderType ?? existing.builderType,
        meta: typeof meta === 'object' ? JSON.stringify(meta) : (meta ?? existing.meta),
        theme: theme ?? existing.theme,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existing.isPublished
      }
    });
    const out = { ...updated, meta: updated.meta ? JSON.parse(updated.meta) : null };
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete resume
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const existing = await prisma.resume.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.resume.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create section
router.post('/section', async (req, res) => {
  try {
    const { resumeId, type, content, position } = req.body || {};
    const rid = parseInt(resumeId, 10);
    if (!rid || !type) return res.status(400).json({ error: 'resumeId and type are required' });
    const resume = await prisma.resume.findFirst({ where: { id: rid, userId: req.user.id }, include: { sections: true } });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    let pos = typeof position === 'number' ? position : (resume.sections.length + 1);
    const sec = await prisma.resumeSection.create({
      data: {
        resumeId: rid,
        type,
        position: pos,
        content: content ? JSON.stringify(content) : '{}'
      }
    });
    return res.json(sec);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update section
router.put('/section/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { type, content, position } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const sec = await prisma.resumeSection.findUnique({ where: { id } });
    if (!sec) return res.status(404).json({ error: 'Not found' });
    const resume = await prisma.resume.findFirst({ where: { id: sec.resumeId, userId: req.user.id } });
    if (!resume) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.resumeSection.update({
      where: { id },
      data: {
        type: type ?? sec.type,
        content: content ? JSON.stringify(content) : sec.content,
        position: typeof position === 'number' ? position : sec.position
      }
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete section
router.delete('/section/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const sec = await prisma.resumeSection.findUnique({ where: { id } });
    if (!sec) return res.status(404).json({ error: 'Not found' });
    const resume = await prisma.resume.findFirst({ where: { id: sec.resumeId, userId: req.user.id } });
    if (!resume) return res.status(403).json({ error: 'Forbidden' });
    await prisma.resumeSection.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
