const express = require('express');
const { prisma, authenticate } = require('../middleware');

const router = express.Router();

// Helper: parse JSON string fields from profile
function parseProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    skills: JSON.parse(profile.skills || '[]'),
    education: JSON.parse(profile.education || '[]'),
    experience: JSON.parse(profile.experience || '[]'),
    projects: JSON.parse(profile.projects || '[]'),
    certifications: JSON.parse(profile.certifications || '[]')
  };
}

// GET /api/profiles/me — get current user's profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete your profile.' });
    }

    res.json(parseProfile(profile));
  } catch (err) {
    next(err);
  }
});

// PUT /api/profiles/me — update profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const {
      title, summary, phone, location,
      linkedin, github, website,
      skills, education, experience, projects, certifications
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (summary !== undefined) data.summary = summary;
    if (phone !== undefined) data.phone = phone;
    if (location !== undefined) data.location = location;
    if (linkedin !== undefined) data.linkedin = linkedin;
    if (github !== undefined) data.github = github;
    if (website !== undefined) data.website = website;
    if (skills !== undefined) data.skills = JSON.stringify(skills);
    if (education !== undefined) data.education = JSON.stringify(education);
    if (experience !== undefined) data.experience = JSON.stringify(experience);
    if (projects !== undefined) data.projects = JSON.stringify(projects);
    if (certifications !== undefined) data.certifications = JSON.stringify(certifications);

    const profile = await prisma.studentProfile.update({
      where: { userId: req.userId },
      data,
      include: { user: { select: { name: true, email: true } } }
    });

    res.json(parseProfile(profile));
  } catch (err) {
    next(err);
  }
});

// GET /api/profiles/completion — profile completion percentage
router.get('/completion', authenticate, async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) return res.json({ completion: 0, missing: ['profile'] });

    const fields = [
      { name: 'title', value: profile.title },
      { name: 'summary', value: profile.summary },
      { name: 'phone', value: profile.phone },
      { name: 'location', value: profile.location },
      { name: 'skills', value: profile.skills, isArray: true },
      { name: 'education', value: profile.education, isArray: true },
      { name: 'experience', value: profile.experience, isArray: true },
      { name: 'projects', value: profile.projects, isArray: true }
    ];

    const missing = [];
    let filled = 0;
    for (const field of fields) {
      if (field.isArray) {
        const arr = JSON.parse(field.value || '[]');
        if (arr.length > 0) filled++;
        else missing.push(field.name);
      } else {
        if (field.value && field.value.trim()) filled++;
        else missing.push(field.name);
      }
    }

    res.json({
      completion: Math.round((filled / fields.length) * 100),
      missing,
      filled,
      total: fields.length
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
