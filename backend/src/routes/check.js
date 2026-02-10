const express = require('express');
const hotspotService = require('../services/hotspotService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Trigger hotspot check immediately
router.post('/', async (req, res) => {
  try {
    const result = await hotspotService.checkHotspots();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get check history
router.get('/history', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const history = await prisma.checkHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
