# 🚀 AI Resume & Portfolio Builder

An AI-powered tool that generates **personalized resumes**, **tailored cover letters**, and **professional portfolio websites** — helping students land better job and internship opportunities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)

## ✨ Features

- **Smart Resume Generator** — AI-optimized resumes with ATS scoring, action verb enhancement, and professional templates
- **Cover Letter Engine** — Personalized cover letters tailored to specific job descriptions and companies
- **Portfolio Builder** — Generate stunning portfolio websites showcasing your projects and skills
- **Student Profile System** — Comprehensive profile management for education, experience, skills, and projects
- **Multiple Templates** — 5+ professional designs for resumes and portfolios
- **PDF Export** — Download publication-ready documents instantly

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (React), Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| AI/LLM | OpenAI GPT-4o / Anthropic Claude |
| PDF | PDFKit |
| Auth | JWT + bcrypt |

## 📦 Project Structure

```
├── frontend/          # Next.js app (UI, pages, components)
├── backend/           # Express API server
│   ├── prisma/        # Database schema
│   └── src/
│       ├── routes/    # API endpoints
│       ├── services/  # Business logic + LLM integration
│       └── utils/     # PDF generation, helpers
├── shared/            # Shared types and constants
└── package.json       # Workspace root
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- OpenAI API key (optional — demo mode available)

### Setup

```bash
# Clone the repository
git clone https://github.com/sammetaraghu86/ai-resume-portfolio-builder.git
cd ai-resume-portfolio-builder

# Install dependencies
npm install

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Initialize database
npm run setup

# Start development servers
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend API on `http://localhost:5000`.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `OPENAI_API_KEY` | OpenAI API key for LLM features | No (demo mode) |
| `ANTHROPIC_API_KEY` | Claude API key (alternative) | No |
| `PORT` | Backend server port (default: 5000) | No |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 👤 Author

**Raghu** — [@sammetaraghu86](https://github.com/sammetaraghu86)
