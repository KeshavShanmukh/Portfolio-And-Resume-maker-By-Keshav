const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const storePlain = process.env.PLAINTEXT_PASSWORDS === 'true';
    const storedPassword = storePlain ? password : await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { username, email, password: storedPassword, role: 'USER' } });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    try {
      fs.appendFileSync('auth-debug.log', `[${new Date().toISOString()}] Login attempt for: ${email} userFound: ${!!user}\n`);
      if (user) fs.appendFileSync('auth-debug.log', `storedPasswordLength: ${user.password ? user.password.length : 'none'}\n`);
    } catch (e) {
      console.error('Failed to write auth-debug.log', e);
    }
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const storePlain = process.env.PLAINTEXT_PASSWORDS === 'true';
    let ok = false;
    if (storePlain) {
      ok = (password === user.password);
      try{ fs.appendFileSync('auth-debug.log', `plaintextCompare:${ok}\n`) }catch(e){}
    } else {
      ok = await bcrypt.compare(password, user.password);
      try{ fs.appendFileSync('auth-debug.log', `bcryptCompare:${ok}\n`) }catch(e){}
    }
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, username: user.username, email: user.email, profileImage: user.profileImage, createdAt: user.createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body || {};
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });
    
    return res.json({ id: updated.id, username: updated.username, email: updated.email, profileImage: updated.profileImage, createdAt: updated.createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
