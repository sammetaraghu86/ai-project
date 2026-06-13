'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '📄',
      title: 'Smart Resume Builder',
      description: 'AI-optimized resumes with ATS scoring, action verb enhancement, and professional templates that get you noticed.',
      color: '#6366f1'
    },
    {
      icon: '✉️',
      title: 'Cover Letter Engine',
      description: 'Personalized cover letters tailored to specific job descriptions. Choose your tone — formal, conversational, or persuasive.',
      color: '#8b5cf6'
    },
    {
      icon: '🌐',
      title: 'Portfolio Generator',
      description: 'Generate stunning portfolio websites with multiple themes. Showcase your projects, skills, and experience beautifully.',
      color: '#a78bfa'
    },
    {
      icon: '🎯',
      title: 'ATS Optimization',
      description: 'Built-in ATS scoring ensures your resume passes automated screening systems used by top employers.',
      color: '#ec4899'
    },
    {
      icon: '⚡',
      title: 'Instant PDF Export',
      description: 'Download publication-ready PDFs with professional typography. Print-perfect every time.',
      color: '#f59e0b'
    },
    {
      icon: '🔒',
      title: 'Your Data, Your Control',
      description: 'All your information stays private and secure. Export your data anytime. No vendor lock-in.',
      color: '#10b981'
    }
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Add your education, experience, skills, and projects in our guided form.' },
    { num: '02', title: 'Choose What to Build', desc: 'Generate a resume, cover letter, or full portfolio — or all three.' },
    { num: '03', title: 'AI Does the Magic', desc: 'Our AI optimizes your content for maximum impact and ATS compatibility.' },
    { num: '04', title: 'Download & Apply', desc: 'Export as PDF, HTML, or share your portfolio link directly with employers.' }
  ];

  return (
    <div className={styles.landing}>
      {/* Background Effects */}
      <div className={styles.bgEffects}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
        <div className={styles.gridOverlay} />
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI-Powered Career Tools
          </div>
          <h1 className={styles.heroTitle}>
            Build Your Career with
            <span className={styles.gradientText}> AI-Powered</span>
            <br />Resumes & Portfolios
          </h1>
          <p className={styles.heroSubtitle}>
            Stop struggling with generic templates. Our AI creates personalized,
            ATS-optimized resumes, compelling cover letters, and stunning portfolios
            that help you stand out and land your dream opportunity.
          </p>
          <div className={styles.heroCTA}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} →
            </button>
            <button className={styles.secondaryBtn} onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>95%</span>
              <span className={styles.statLabel}>ATS Pass Rate</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>5+</span>
              <span className={styles.statLabel}>Pro Templates</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>30s</span>
              <span className={styles.statLabel}>Generation Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Everything You Need to <span className={styles.gradientText}>Stand Out</span></h2>
            <p>Powerful AI tools designed specifically for students and early-career professionals.</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ '--card-accent': f.color }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>How It <span className={styles.gradientText}>Works</span></h2>
            <p>From profile to professional documents in four simple steps.</p>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2>Ready to Build Your Future?</h2>
            <p>Join students who are landing interviews with AI-optimized career documents.</p>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Building Now'} →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerLogo}>
              <span>✦</span> ResumeAI
            </div>
            <p>Built with ❤️ for students everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
