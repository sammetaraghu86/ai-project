'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [completion, setCompletion] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  async function loadDashboardData() {
    try {
      const [comp, res, cls, ports] = await Promise.all([
        api.getProfileCompletion(),
        api.listResumes(),
        api.listCoverLetters(),
        api.listPortfolios()
      ]);
      setCompletion(comp);
      setResumes(res);
      setCoverLetters(cls);
      setPortfolios(ports);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  const quickActions = [
    {
      icon: '📄',
      title: 'Generate Resume',
      desc: 'Create an AI-optimized resume from your profile',
      color: '#6366f1',
      path: '/resume'
    },
    {
      icon: '✉️',
      title: 'Write Cover Letter',
      desc: 'Craft a personalized letter for any job',
      color: '#8b5cf6',
      path: '/cover-letter'
    },
    {
      icon: '🌐',
      title: 'Build Portfolio',
      desc: 'Generate a stunning portfolio website',
      color: '#a78bfa',
      path: '/portfolio'
    }
  ];

  const totalDocs = resumes.length + coverLetters.length + portfolios.length;
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length)
    : 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Welcome Header */}
        <div className={styles.welcome}>
          <div>
            <h1>Welcome back, <span className={styles.gradientText}>{user?.name}</span>! 👋</h1>
            <p>Build and manage your AI-powered career documents.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <Card className={styles.statCard} hover={false}>
            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>📊</div>
            <div>
              <div className={styles.statValue}>{completion?.completion || 0}%</div>
              <div className={styles.statLabel}>Profile Complete</div>
            </div>
            {completion && completion.completion < 100 && (
              <button className={styles.completeBtn} onClick={() => router.push('/resume')}>
                Complete →
              </button>
            )}
          </Card>
          <Card className={styles.statCard} hover={false}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>📁</div>
            <div>
              <div className={styles.statValue}>{totalDocs}</div>
              <div className={styles.statLabel}>Documents Created</div>
            </div>
          </Card>
          <Card className={styles.statCard} hover={false}>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🎯</div>
            <div>
              <div className={styles.statValue}>{avgScore > 0 ? `${avgScore}%` : '—'}</div>
              <div className={styles.statLabel}>Avg ATS Score</div>
            </div>
          </Card>
        </div>

        {/* Profile Completion Bar */}
        {completion && completion.completion < 100 && (
          <Card className={styles.completionCard} hover={false}>
            <div className={styles.completionHeader}>
              <h3>Complete Your Profile</h3>
              <span className={styles.completionPct}>{completion.completion}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${completion.completion}%` }} />
            </div>
            <p className={styles.completionHint}>
              Missing: {completion.missing?.join(', ')}. A complete profile produces better AI results.
            </p>
          </Card>
        )}

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <Card key={i} className={styles.actionCard} glow onClick={() => router.push(action.path)}>
                <div className={styles.actionIcon} style={{ background: `${action.color}20`, color: action.color }}>
                  {action.icon}
                </div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
                <span className={styles.actionArrow}>→</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className={styles.section}>
          <h2>Recent Documents</h2>
          {totalDocs === 0 ? (
            <Card className={styles.emptyState} hover={false}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No documents yet</h3>
              <p>Generate your first resume, cover letter, or portfolio using the quick actions above.</p>
            </Card>
          ) : (
            <div className={styles.docsList}>
              {resumes.slice(0, 3).map(r => (
                <Card key={r.id} className={styles.docItem} onClick={() => router.push(`/resume?id=${r.id}`)}>
                  <div className={styles.docIcon}>📄</div>
                  <div className={styles.docInfo}>
                    <h4>{r.title}</h4>
                    <span className={styles.docMeta}>Resume • ATS: {r.atsScore}% • {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
              {coverLetters.slice(0, 3).map(cl => (
                <Card key={cl.id} className={styles.docItem} onClick={() => router.push(`/cover-letter?id=${cl.id}`)}>
                  <div className={styles.docIcon}>✉️</div>
                  <div className={styles.docInfo}>
                    <h4>{cl.jobTitle} at {cl.company}</h4>
                    <span className={styles.docMeta}>Cover Letter • {cl.tone} • {new Date(cl.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
              {portfolios.slice(0, 3).map(p => (
                <Card key={p.id} className={styles.docItem} onClick={() => router.push(`/portfolio?id=${p.id}`)}>
                  <div className={styles.docIcon}>🌐</div>
                  <div className={styles.docInfo}>
                    <h4>{p.title}</h4>
                    <span className={styles.docMeta}>Portfolio • {p.theme} theme • {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
