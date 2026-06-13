const express = require('express');
const { prisma, authenticate } = require('../middleware');
const { generatePortfolio } = require('../services/llm');

const router = express.Router();

/**
 * Generate standalone portfolio HTML from content data
 */
function generatePortfolioHTML(content, theme) {
  const themeColors = {
    developer: { bg: '#0f172a', card: '#1e293b', accent: '#3b82f6', text: '#e2e8f0', muted: '#94a3b8' },
    creative: { bg: '#1a1a2e', card: '#16213e', accent: '#e94560', text: '#eaeaea', muted: '#a0a0a0' },
    minimal: { bg: '#ffffff', card: '#f8fafc', accent: '#0f172a', text: '#1e293b', muted: '#64748b' },
    nature: { bg: '#064e3b', card: '#065f46', accent: '#34d399', text: '#ecfdf5', muted: '#a7f3d0' }
  };

  const c = themeColors[theme] || themeColors.developer;

  const skillsHTML = (content.skills || []).map(cat => `
    <div class="skill-category">
      <h3>${cat.category}</h3>
      <div class="skill-tags">
        ${(cat.items || []).map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>`).join('');

  const projectsHTML = (content.projects || []).map(p => `
    <div class="project-card">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="skill-tags">
        ${(p.technologies || []).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      ${p.highlights ? `<ul>${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>` : ''}
    </div>`).join('');

  const experienceHTML = (content.experience || []).map(e => `
    <div class="experience-item">
      <h3>${e.title} <span class="muted">at ${e.company}</span></h3>
      <p class="period">${e.period}</p>
      <p>${e.description}</p>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.hero?.headline || 'My Portfolio'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: ${c.bg};
      color: ${c.text};
      line-height: 1.6;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }

    /* Hero */
    .hero {
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px 24px;
    }
    .hero h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(135deg, ${c.accent}, ${c.text});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p { font-size: 1.25rem; color: ${c.muted}; max-width: 600px; }

    /* Sections */
    section { padding: 60px 0; }
    section h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      margin-bottom: 32px;
      color: ${c.accent};
    }

    /* About */
    .about p { font-size: 1.05rem; color: ${c.muted}; white-space: pre-line; }

    /* Skills */
    .skill-category { margin-bottom: 24px; }
    .skill-category h3 { font-size: 1rem; margin-bottom: 12px; color: ${c.text}; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      padding: 6px 14px;
      background: ${c.card};
      border: 1px solid ${c.accent}40;
      border-radius: 20px;
      font-size: 0.85rem;
      color: ${c.accent};
      transition: all 0.2s;
    }
    .tag:hover { background: ${c.accent}20; transform: translateY(-2px); }

    /* Projects */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .project-card {
      background: ${c.card};
      border: 1px solid ${c.accent}20;
      border-radius: 12px;
      padding: 24px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .project-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px ${c.accent}15; }
    .project-card h3 { margin-bottom: 8px; color: ${c.text}; }
    .project-card p { color: ${c.muted}; margin-bottom: 12px; font-size: 0.95rem; }
    .project-card ul { padding-left: 18px; color: ${c.muted}; font-size: 0.9rem; }

    /* Experience */
    .experience-item {
      padding: 20px 0;
      border-bottom: 1px solid ${c.accent}15;
    }
    .experience-item:last-child { border-bottom: none; }
    .experience-item h3 { font-size: 1.1rem; }
    .experience-item .muted { font-weight: 400; color: ${c.muted}; }
    .experience-item .period { font-size: 0.85rem; color: ${c.accent}; margin: 4px 0 8px; }
    .experience-item p { color: ${c.muted}; }

    /* Contact */
    .contact { text-align: center; padding: 80px 24px; }
    .contact p { color: ${c.muted}; font-size: 1.05rem; margin-top: 16px; }

    /* Responsive */
    @media (max-width: 600px) {
      .hero h1 { font-size: 2rem; }
      section h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="container">
      <h1>${content.hero?.headline || 'Hello World'}</h1>
      <p>${content.hero?.subheadline || ''}</p>
    </div>
  </section>

  <section class="about">
    <div class="container">
      <h2>About Me</h2>
      <p>${content.about || ''}</p>
    </div>
  </section>

  <section>
    <div class="container">
      <h2>Skills</h2>
      ${skillsHTML}
    </div>
  </section>

  <section>
    <div class="container">
      <h2>Projects</h2>
      <div class="projects-grid">${projectsHTML}</div>
    </div>
  </section>

  ${experienceHTML ? `
  <section>
    <div class="container">
      <h2>Experience</h2>
      ${experienceHTML}
    </div>
  </section>` : ''}

  <section class="contact">
    <div class="container">
      <h2>${content.contact?.headline || "Let's Connect"}</h2>
      <p>${content.contact?.message || ''}</p>
    </div>
  </section>
</body>
</html>`;
}

// POST /api/portfolios/generate
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { theme, title } = req.body;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { name: true, email: true } } }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile first.' });
    }

    const content = await generatePortfolio(profile);
    const htmlContent = generatePortfolioHTML(content, theme || 'developer');

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: req.userId,
        title: title || `Portfolio - ${new Date().toLocaleDateString()}`,
        theme: theme || 'developer',
        sections: JSON.stringify(content),
        htmlContent
      }
    });

    res.status(201).json({
      id: portfolio.id,
      title: portfolio.title,
      theme: portfolio.theme,
      content,
      createdAt: portfolio.createdAt
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolios
router.get('/', authenticate, async (req, res, next) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, theme: true, createdAt: true }
    });
    res.json(portfolios);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolios/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    res.json({
      ...portfolio,
      sections: JSON.parse(portfolio.sections)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolios/:id/html — download portfolio HTML
router.get('/:id/html', authenticate, async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="portfolio-${portfolio.id}.html"`);
    res.send(portfolio.htmlContent);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolios/:id/preview — render portfolio in browser
router.get('/:id/preview', async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id }
    });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    res.setHeader('Content-Type', 'text/html');
    res.send(portfolio.htmlContent);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/portfolios/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.portfolio.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ message: 'Portfolio deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
