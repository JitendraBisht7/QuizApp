require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── Question Model ────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctAnswer: Number, // Index of the correct option
});
const Question = mongoose.model('Question', questionSchema);

// ─── Score / Leaderboard Model ─────────────────────────────────────────────────
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Score = mongoose.model('Score', scoreSchema);

// ─── Routes ────────────────────────────────────────────────────────────────────

// GET /api/questions?count=20  — returns random subset of questions
app.get('/api/questions', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 20;
    const questions = await Question.aggregate([{ $sample: { size: count } }]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/scores — save a score
app.post('/api/scores', async (req, res) => {
  try {
    const { name, score, total } = req.body;
    if (!name || score == null || total == null) {
      return res.status(400).json({ error: 'name, score, and total are required' });
    }
    const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
    const newScore = new Score({ name, score, total, percentage });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// GET /api/leaderboard — top 50 all-time scores
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Score.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(50)
      .select('name score total percentage createdAt');
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
