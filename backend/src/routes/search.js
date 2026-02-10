const express = require('express');
const hotspotService = require('../services/hotspotService');
const router = express.Router();

// Search hotspots
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = await hotspotService.searchHotspots(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
