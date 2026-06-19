require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const portfolioRoutes = require('./routes/portfolio');

app.use('/api/auth', authRoutes);
app.use('/api/portfolio', authMiddleware, portfolioRoutes);

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  return res.json({ message: 'Protected dashboard', userId: req.user.id });
});

const PORT = process.env.PORT || 4000;
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
