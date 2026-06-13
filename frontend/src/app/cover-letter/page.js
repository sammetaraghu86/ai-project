'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import styles from './coverletter.module.css';

const TONES = [
  { value: 'formal', label: '🏢 Formal', desc: 'Professional and traditional' },
  { value: 'conversational', label: '💬 Conversational', desc: 'Friendly and approachable' },
  { value: 'persuasive', label: '🎯 Persuasive', desc: 'Confident and compelling' }
];

export default function CoverLetterPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ jobTitle: '', company: '', jobDescription: '', tone: 'formal' });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [letters, setLetters] = useState([]);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) loadLetters();
  }, [isAuthenticated]);

  async function loadLetters() {
    try {
      const data = await api.listCoverLetters();
      setLetters(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.jobTitle || !form.company) {
      setError('Job title and company are required');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const data = await api.generateCoverLetter(form.jobTitle, form.company, form.jobDescription, form.tone);
      setResult(data);
      loadLetters();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!result?.id) return;
    try {
      const blob = await api.downloadCoverLetterPDF(result.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter-${result.company}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCopy() {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
    }
  }

  if (authLoading || !isAuthenticated) {
    return <div className={styles.loading}><div className="spinner" /></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Cover Letter <span className={styles.gradientText}>Generator</span></h1>
            <p>Paste a job description and let AI craft the perfect cover letter.</p>
          </div>
          {letters.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide History' : `📜 History (${letters.length})`}
            </Button>
          )}
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.layout}>
          {/* Form */}
          <Card className={styles.formCard} hover={false}>
            <form onSubmit={handleGenerate}>
              <div className={styles.formGrid}>
                <Input label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Software Engineer" required />
                <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" required />
              </div>

              <Input label="Job Description" textarea rows={6} value={form.jobDescription}
                onChange={e => setForm({ ...form, jobDescription: e.target.value })}
                placeholder="Paste the full job description here for a more targeted letter..." />

              <div className={styles.toneSection}>
                <label className={styles.toneLabel}>Tone</label>
                <div className={styles.toneOptions}>
                  {TONES.map(t => (
                    <button key={t.value} type="button"
                      className={`${styles.toneOption} ${form.tone === t.value ? styles.toneActive : ''}`}
                      onClick={() => setForm({ ...form, tone: t.value })}>
                      <span className={styles.toneIcon}>{t.label}</span>
                      <span className={styles.toneDesc}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" fullWidth loading={generating} size="lg">
                ✨ Generate Cover Letter
              </Button>
            </form>
          </Card>

          {/* Result */}
          {result && (
            <Card className={styles.resultCard} hover={false}>
              <div className={styles.resultHeader}>
                <h3>{result.jobTitle} at {result.company}</h3>
                <div className={styles.resultActions}>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>📋 Copy</Button>
                  <Button variant="secondary" size="sm" onClick={handleDownload}>📥 PDF</Button>
                </div>
              </div>
              <div className={styles.letterContent}>
                {result.content}
              </div>
            </Card>
          )}
        </div>

        {/* History */}
        {showHistory && letters.length > 0 && (
          <div className={styles.history}>
            <h3>Previous Letters</h3>
            <div className={styles.historyList}>
              {letters.map(l => (
                <Card key={l.id} className={styles.historyItem}
                  onClick={async () => {
                    const full = await api.getCoverLetter(l.id);
                    setResult(full);
                  }}>
                  <div className={styles.historyInfo}>
                    <strong>{l.jobTitle}</strong>
                    <span>{l.company} • {l.tone} • {new Date(l.createdAt).toLocaleDateString()}</span>
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
