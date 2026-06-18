require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  return res.json({ message: 'Protected dashboard', userId: req.user.id });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
