'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import styles from './portfolio.module.css';

const THEMES = [
  { value: 'developer', label: '💻 Developer', desc: 'Dark, modern, techy', colors: ['#0f172a', '#3b82f6'] },
  { value: 'creative', label: '🎨 Creative', desc: 'Bold and artistic', colors: ['#1a1a2e', '#e94560'] },
  { value: 'minimal', label: '✨ Minimal', desc: 'Clean and elegant', colors: ['#ffffff', '#0f172a'] },
  { value: 'nature', label: '🌿 Nature', desc: 'Fresh and organic', colors: ['#064e3b', '#34d399'] }
];

export default function PortfolioPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState('developer');
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) loadPortfolios();
  }, [isAuthenticated]);

  async function loadPortfolios() {
    try {
      const data = await api.listPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const data = await api.generatePortfolio(theme, title || undefined);
      setResult(data);
      // Load full portfolio with HTML
      const full = await api.getPortfolio(data.id);
      setPreviewHtml(full.htmlContent);
      loadPortfolios();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!result?.id) return;
    try {
      const html = await api.downloadPortfolioHTML(result.id);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${result.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadPortfolioPreview(id) {
    try {
      const full = await api.getPortfolio(id);
      setResult({ id: full.id, title: full.title, theme: full.theme });
      setPreviewHtml(full.htmlContent);
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading || !isAuthenticated) {
    return <div className={styles.loading}><div className="spinner" /></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Portfolio <span className={styles.gradientText}>Builder</span></h1>
          <p>Generate a stunning portfolio website from your profile data.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Theme Selector */}
        <Card className={styles.configCard} hover={false}>
          <h2>Choose Your Theme</h2>
          <div className={styles.themeGrid}>
            {THEMES.map(t => (
              <button key={t.value}
                className={`${styles.themeOption} ${theme === t.value ? styles.themeActive : ''}`}
                onClick={() => setTheme(t.value)}>
                <div className={styles.themePreview}>
                  <div style={{ background: t.colors[0], flex: 1 }} />
                  <div style={{ background: t.colors[1], width: '30%' }} />
                </div>
                <span className={styles.themeLabel}>{t.label}</span>
                <span className={styles.themeDesc}>{t.desc}</span>
              </button>
            ))}
          </div>

          <Input label="Portfolio Title (optional)" value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. My Developer Portfolio" />

          <Button onClick={handleGenerate} loading={generating} size="lg" fullWidth>
            🚀 Generate Portfolio
          </Button>
        </Card>

        {/* Preview */}
        {previewHtml && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h2>Portfolio Preview</h2>
              <div className={styles.previewActions}>
                <Button onClick={handleDownload} icon="📥">Download HTML</Button>
                <Button variant="secondary" onClick={() => {
                  const win = window.open('', '_blank');
                  win.document.write(previewHtml);
                  win.document.close();
                }}>🔗 Open Full Page</Button>
              </div>
            </div>
            <div className={styles.previewFrame}>
              <iframe
                srcDoc={previewHtml}
                className={styles.iframe}
                title="Portfolio Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}

        {/* History */}
        {portfolios.length > 0 && (
          <div className={styles.historySection}>
            <h3>Previous Portfolios</h3>
            <div className={styles.historyGrid}>
              {portfolios.map(p => (
                <Card key={p.id} className={styles.historyItem}
                  onClick={() => loadPortfolioPreview(p.id)}>
                  <div className={styles.historyTheme}>
                    {THEMES.find(t => t.value === p.theme)?.label || '💻'}
                  </div>
                  <div className={styles.historyInfo}>
                    <strong>{p.title}</strong>
                    <span>{p.theme} theme • {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
