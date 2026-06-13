const express = require('express');
const { prisma, authenticate } = require('../middleware');
const { generateResume } = require('../services/llm');
const { generateResumePDF } = require('../utils/pdfGenerator');

const router = express.Router();

// POST /api/resumes/generate — generate a new resume using AI
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { targetRole, templateType } = req.body;

    // Fetch profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile before generating a resume.' });
    }

    // Generate resume content via LLM
    const resumeContent = await generateResume(profile, targetRole);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        title: `Resume - ${targetRole || 'General'} - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify(resumeContent),
        templateType: templateType || 'modern',
        atsScore: resumeContent.atsScore || 0
      }
    });

    res.status(201).json({
      id: resume.id,
      title: resume.title,
      templateType: resume.templateType,
      atsScore: resume.atsScore,
      content: resumeContent,
      createdAt: resume.createdAt
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes — list user's resumes
router.get('/', authenticate, async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, templateType: true,
        atsScore: true, createdAt: true, updatedAt: true
      }
    });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id — get a specific resume
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    res.json({
      ...resume,
      content: JSON.parse(resume.content)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id/pdf — download resume as PDF
router.get('/:id/pdf', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const resumeData = JSON.parse(resume.content);
    const pdfBuffer = await generateResumePDF(resumeData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${resume.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.resume.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
