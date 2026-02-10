const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.get('/test', (req, res) => {
  res.send('hotspots router works')
})

// Get statistics
router.get('/statistics', async (req, res) => {

  try {
    const hotspotService = require('../services/hotspotService');
    const stats = await hotspotService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all hotspots with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, source } = req.query;
    const skip = (page - 1) * limit;

    const where = source ? { source } : {};

    const [hotspots, total] = await Promise.all([
      prisma.hotspot.findMany({
        where,
        include: {
          keywords: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.hotspot.count({ where })
    ]);

    res.json({
      data: hotspots,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hotspot by ID
router.get('/:id', async (req, res) => {
  try {
    const hotspot = await prisma.hotspot.findUnique({
      where: { id: req.params.id },
      include: {
        keywords: true
      }
    });

    if (!hotspot) {
      return res.status(404).json({ error: 'Hotspot not found' });
    }

    res.json(hotspot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get latest hotspots (for dashboard)
router.get('/dashboard/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const hotspots = await prisma.hotspot.findMany({
      include: {
        keywords: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
