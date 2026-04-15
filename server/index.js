import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// In-memory leaderboard
let leaderboard = [];

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.get('/api/leaderboard', (_, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
  res.json(sorted);
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, avatar } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'name and score required' });
  }
  const entry = { id: Date.now(), name, score, avatar: avatar || '🧠', ts: new Date().toISOString() };
  leaderboard.push(entry);
  // Keep top 100
  leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 100);
  res.json(entry);
});

app.listen(PORT, () => {
  console.log(`\n  🧠 MindGames API  →  http://localhost:${PORT}\n`);
});
