const Item = require('../models/Item');

/**
 * Normalize a string: lowercase, remove punctuation, split into words.
 * @param {string} str
 * @returns {Set<string>}
 */
const tokenize = (str = '') => {
  const words = str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  return new Set(words);
};

/**
 * Jaccard similarity between two Sets.
 */
const jaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Calculate date score based on absolute difference in days.
 */
const dateScore = (dateA, dateB) => {
  const diffMs = Math.abs(new Date(dateA) - new Date(dateB));
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays === 0) return 20;
  if (diffDays <= 1) return 15;
  if (diffDays <= 3) return 10;
  if (diffDays <= 7) return 5;
  return 0;
};

/**
 * Find matching items for a given item above a threshold score.
 * @param {Object} newItem - Mongoose Item document or plain object
 * @param {number} threshold - Minimum score to include (default 70)
 * @returns {Promise<Array<{matchedItem: Object, score: number}>>}
 */
const findMatches = async (newItem, threshold = 70) => {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

  const candidates = await Item.find({
    type: oppositeType,
    status: 'active',
    _id: { $ne: newItem._id },
  }).lean();

  const results = [];

  for (const candidate of candidates) {
    let score = 0;

    // Category: exact match = 30 pts
    if (candidate.category === newItem.category) {
      score += 30;
    }

    // Location: Jaccard similarity * 25
    const locA = tokenize(newItem.location);
    const locB = tokenize(candidate.location);
    score += Math.round(jaccardSimilarity(locA, locB) * 25);

    // Date score (max 20)
    score += dateScore(newItem.date, candidate.date);

    // Title + Description: Jaccard * 25
    const textA = tokenize(`${newItem.title} ${newItem.description}`);
    const textB = tokenize(`${candidate.title} ${candidate.description}`);
    score += Math.round(jaccardSimilarity(textA, textB) * 25);

    if (score >= threshold) {
      results.push({
        matchedItem: {
          _id: candidate._id,
          title: candidate.title,
          type: candidate.type,
          category: candidate.category,
          location: candidate.location,
          date: candidate.date,
          approximateTime: candidate.approximateTime,
          status: candidate.status,
          image: candidate.image,
          userId: candidate.userId,
          createdAt: candidate.createdAt,
        },
        score,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
};

module.exports = { findMatches };
