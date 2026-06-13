const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma, validate, authenticate } = require('../middleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register',
  validate({
    name: { required: true, minLength: 2 },
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 6 }
  }),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      // Hash password & create user
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: { id: true, name: true, email: true, createdAt: true }
      });

      // Create empty profile
      await prisma.studentProfile.create({
        data: { userId: user.id }
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post('/login',
  validate({
    email: { required: true, type: 'email' },
    password: { required: true }
  }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me — get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
