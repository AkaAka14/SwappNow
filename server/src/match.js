
const express = require('express');
const router = express.Router();
const { findMatches } = require('../services/matchService');

router.post('/for-user', async (req, res) => {
  try {
    const { userId, topK = 5 } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const matches = await findMatches(userId, topK);
    res.json({ matches });
  } catch (err) {
    console.error('match error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;