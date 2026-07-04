const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create portfolio
router.post('/create', async (req, res) => {
  try {
    const { title, description, theme, isPublished, builderType, meta, codeHtml, codeCss, codeJs, hostedUrl } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const p = await prisma.portfolio.create({
      data: {
        userId: req.user.id,
        title,
        description: description || null,
        builderType: builderType || 'DRAG_DROP',
        meta: meta ? JSON.stringify(meta) : null,
        codeHtml: codeHtml || null,
        codeCss: codeCss || null,
        codeJs: codeJs || null,
        theme: theme || 'default',
        isPublished: !!isPublished,
        hostedUrl: hostedUrl || null
      }
    });
    return res.json(p);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List user's portfolios
router.get('/', async (req, res) => {
  try {
    const list = await prisma.portfolio.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get portfolio by id with sections
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const p = await prisma.portfolio.findFirst({
      where: { id, userId: req.user.id },
      include: { sections: { orderBy: { position: 'asc' } } }
    });
    if (!p) return res.status(404).json({ error: 'Not found' });
    // parse meta if present
    const out = { ...p, meta: p.meta ? JSON.parse(p.meta) : null };
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update portfolio
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const existing = await prisma.portfolio.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { title, description, theme, isPublished, builderType, meta, codeHtml, codeCss, codeJs, hostedUrl } = req.body || {};
    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        builderType: builderType ?? existing.builderType,
        meta: typeof meta === 'object' ? JSON.stringify(meta) : (meta ?? existing.meta),
        codeHtml: codeHtml ?? existing.codeHtml,
        codeCss: codeCss ?? existing.codeCss,
        codeJs: codeJs ?? existing.codeJs,
        theme: theme ?? existing.theme,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existing.isPublished,
        hostedUrl: hostedUrl ?? existing.hostedUrl
      }
    });
    const out = { ...updated, meta: updated.meta ? JSON.parse(updated.meta) : null };
    return res.json(out);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete portfolio
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const existing = await prisma.portfolio.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.portfolio.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create section
router.post('/section', async (req, res) => {
  try {
    const { portfolioId, type, content, position } = req.body || {};
    const pid = parseInt(portfolioId, 10);
    if (!pid || !type) return res.status(400).json({ error: 'portfolioId and type are required' });
    const portfolio = await prisma.portfolio.findFirst({ where: { id: pid, userId: req.user.id }, include: { sections: true } });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    let pos = typeof position === 'number' ? position : (portfolio.sections.length + 1);
    const sec = await prisma.portfolioSection.create({
      data: {
        portfolioId: pid,
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
    const sec = await prisma.portfolioSection.findUnique({ where: { id } });
    if (!sec) return res.status(404).json({ error: 'Not found' });
    const portfolio = await prisma.portfolio.findFirst({ where: { id: sec.portfolioId, userId: req.user.id } });
    if (!portfolio) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.portfolioSection.update({
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
    const sec = await prisma.portfolioSection.findUnique({ where: { id } });
    if (!sec) return res.status(404).json({ error: 'Not found' });
    const portfolio = await prisma.portfolio.findFirst({ where: { id: sec.portfolioId, userId: req.user.id } });
    if (!portfolio) return res.status(403).json({ error: 'Forbidden' });
    await prisma.portfolioSection.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
