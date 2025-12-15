const axios = require('axios');
const User = require('../models/User');

async function callDeepSeekForUser(userId, topK = 5) {
  const DEEPSEEK_URL = process.env.DEEPSEEK_URL;
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!DEEPSEEK_URL || !DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek not configured');
  }

  // Example payload - adapt to DeepSeek API contract
  const payload = {
    userId,
    topK
  };

  const resp = await axios.post(`${DEEPSEEK_URL}/match`, payload, {
    headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}` }
  });
  return resp.data;
}

async function fallbackMongoMatch(userId, topK = 5) {
  // Example simple fallback: find users with overlapping skills
  const me = await User.findById(userId).lean();
  if (!me || !me.skills || me.skills.length === 0) return [];

  const matches = await User.find({
    _id: { $ne: me._id },
    skills: { $in: me.skills }
  })
    .limit(topK)
    .lean();

  return matches;
}

async function findMatches(userId, topK = 5) {
  try {
    const ds = await callDeepSeekForUser(userId, topK);
    // expect ds to be array of user IDs or user objects; adapt as needed
    if (Array.isArray(ds) && ds.length > 0) return ds;
    // fallback to mongo
    return await fallbackMongoMatch(userId, topK);
  } catch (err) {
    console.warn('DeepSeek failed, falling back to Mongo:', err.message);
    return await fallbackMongoMatch(userId, topK);
  }
}

module.exports = { findMatches };