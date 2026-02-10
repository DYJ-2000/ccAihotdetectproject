const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get all keywords
router.get('/', async (req, res) => {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new keyword
router.post('/', async (req, res) => {
  try {
    const { keyword, source = 'Both' } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const newKeyword = await prisma.keyword.create({
      data: { keyword, source }
    });

    res.status(201).json(newKeyword);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Keyword already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update a keyword
router.put('/:id', async (req, res) => {
  try {
    const { isActive, source } = req.body;

    const updatedKeyword = await prisma.keyword.update({
      where: { id: req.params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(source !== undefined && { source })
      }
    });

    res.json(updatedKeyword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a keyword
router.delete('/:id', async (req, res) => {
  try {
    await prisma.keyword.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
