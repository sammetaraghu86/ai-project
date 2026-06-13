const express = require('express');
const { prisma, authenticate } = require('../middleware');
const { generateCoverLetter } = require('../services/llm');
const { generateCoverLetterPDF } = require('../utils/pdfGenerator');

const router = express.Router();

// POST /api/cover-letters/generate
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { jobTitle, company, jobDescription, tone } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({ error: 'jobTitle and company are required' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile first.' });
    }

    const content = await generateCoverLetter(
      profile, jobTitle, company, jobDescription || '', tone || 'formal'
    );

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: req.userId,
        jobTitle,
        company,
        jobDescription: jobDescription || '',
        content,
        tone: tone || 'formal'
      }
    });

    res.status(201).json(coverLetter);
  } catch (err) {
    next(err);
  }
});

// GET /api/cover-letters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const letters = await prisma.coverLetter.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, jobTitle: true, company: true,
        tone: true, createdAt: true
      }
    });
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

// GET /api/cover-letters/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const letter = await prisma.coverLetter.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!letter) return res.status(404).json({ error: 'Cover letter not found' });
    res.json(letter);
  } catch (err) {
    next(err);
  }
});

// GET /api/cover-letters/:id/pdf
router.get('/:id/pdf', authenticate, async (req, res, next) => {
  try {
    const letter = await prisma.coverLetter.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!letter) return res.status(404).json({ error: 'Cover letter not found' });

    const pdfBuffer = await generateCoverLetterPDF(letter.content, '');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cover-letter-${letter.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cover-letters/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.coverLetter.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ message: 'Cover letter deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
