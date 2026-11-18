const Item = require('../models/Item');

const ignoredWords = new Set([
  'a', 'an', 'and', 'at', 'found', 'i', 'in', 'item', 'it', 'lost', 'my',
  'near', 'of', 'on', 'someone', 'the', 'their', 'this', 'to', 'was', 'with',
]);

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
    .filter((word) => word.length > 1 && !ignoredWords.has(word));
  return new Set(words);
};

/**
 * Jaccard similarity between two Sets.
 */
const jaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Calculate date score based on absolute difference in days.
 */
const dateScore = (dateA, dateB) => {
  const diffMs = Math.abs(new Date(dateA) - new Date(dateB));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 20;
  if (diffDays <= 1) return 16;
  if (diffDays <= 3) return 12;
  if (diffDays <= 7) return 6;
  return 0;
};

const categoryScore = (categoryA, categoryB) => {
  if (categoryA === categoryB) return 30;
  if (
    (categoryA === 'Wallets & Accessories' && categoryB === 'ID Cards') ||
    (categoryA === 'ID Cards' && categoryB === 'Wallets & Accessories')
  ) return 15;
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
    userId: { $ne: newItem.userId },
    _id: { $ne: newItem._id },
    date: {
      $gte: new Date(new Date(newItem.date).getTime() - 30 * 24 * 60 * 60 * 1000),
      $lte: new Date(new Date(newItem.date).getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  }).lean();

  const results = [];

  for (const candidate of candidates) {
    let score = 0;

    // Category: exact match = 30 pts
    score += categoryScore(candidate.category, newItem.category);

    // Location: keyword similarity * 25
    const locA = tokenize(newItem.location);
    const locB = tokenize(candidate.location);
    score += Math.round(jaccardSimilarity(locA, locB) * 25);

    // Date score (max 20)
    score += dateScore(newItem.date, candidate.date);

    // Title + Description: Jaccard similarity * 25
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
