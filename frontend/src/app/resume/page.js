'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import styles from './resume.module.css';

const STEPS = ['Personal Info', 'Education', 'Experience', 'Skills & Projects', 'Generate'];

export default function ResumePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [form, setForm] = useState({
    title: '', summary: '', phone: '', location: '', linkedin: '', github: '', website: '',
    skills: [],
    education: [{ degree: '', school: '', location: '', graduationDate: '', gpa: '' }],
    experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
    projects: [{ name: '', description: '', technologies: '' }]
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) loadProfile();
  }, [isAuthenticated]);

  async function loadProfile() {
    try {
      const p = await api.getProfile();
      setProfile(p);
      setForm({
        title: p.title || '',
        summary: p.summary || '',
        phone: p.phone || '',
        location: p.location || '',
        linkedin: p.linkedin || '',
        github: p.github || '',
        website: p.website || '',
        skills: p.skills || [],
        education: p.education?.length > 0 ? p.education : [{ degree: '', school: '', location: '', graduationDate: '', gpa: '' }],
        experience: p.experience?.length > 0 ? p.experience : [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
        projects: p.projects?.length > 0 ? p.projects.map(proj => ({
          ...proj,
          technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''
        })) : [{ name: '', description: '', technologies: '' }]
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }

  async function saveProfile() {
    try {
      const data = {
        ...form,
        projects: form.projects.map(p => ({
          ...p,
          technologies: typeof p.technologies === 'string'
            ? p.technologies.split(',').map(t => t.trim()).filter(Boolean)
            : p.technologies
        }))
      };
      await api.updateProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await saveProfile();
      const result = await api.generateResume(targetRole || form.title, 'modern');
      setResume(result);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadPDF() {
    if (!resume?.id) return;
    try {
      const blob = await api.downloadResumePDF(resume.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resume.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateArrayItem(arrayName, index, field, value) {
    setForm(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  }

  function addArrayItem(arrayName, template) {
    setForm(prev => ({ ...prev, [arrayName]: [...prev[arrayName], template] }));
  }

  function removeArrayItem(arrayName, index) {
    setForm(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  }

  function addSkill() {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  }

  function removeSkill(skill) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  if (authLoading || !isAuthenticated) {
    return <div className={styles.loading}><div className="spinner" /></div>;
  }

  return (
    <div className={styles.resumePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Resume <span className={styles.gradientText}>Builder</span></h1>
          <p>Complete your profile and let AI generate a professional, ATS-optimized resume.</p>
        </div>

        {/* Step Indicator */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <button
              key={i}
              className={`${styles.stepBtn} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}
              onClick={() => i <= step || resume ? setStep(i) : null}
            >
              <span className={styles.stepNum}>{i < step ? '✓' : i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
            </button>
          ))}
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        {saved && <div className={styles.successBox}>✓ Profile saved successfully</div>}

        {/* Step Content */}
        <div className={styles.stepContent}>
          {step === 0 && (
            <Card className={styles.formCard} hover={false}>
              <h2>Personal Information</h2>
              <div className={styles.formGrid}>
                <Input label="Professional Title" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Full Stack Developer" />
                <Input label="Phone" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+1 234 567 8900" />
                <Input label="Location" value={form.location} onChange={e => updateField('location', e.target.value)} placeholder="City, State" />
                <Input label="LinkedIn" value={form.linkedin} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
                <Input label="GitHub" value={form.github} onChange={e => updateField('github', e.target.value)} placeholder="github.com/..." />
                <Input label="Website" value={form.website} onChange={e => updateField('website', e.target.value)} placeholder="yoursite.com" />
              </div>
              <Input label="Professional Summary" textarea value={form.summary} onChange={e => updateField('summary', e.target.value)} placeholder="A brief 2-3 sentence summary of your professional profile..." rows={4} />
              <div className={styles.formActions}>
                <Button onClick={() => { saveProfile(); setStep(1); }}>Save & Continue →</Button>
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card className={styles.formCard} hover={false}>
              <h2>Education</h2>
              {form.education.map((edu, i) => (
                <div key={i} className={styles.arrayItem}>
                  <div className={styles.arrayHeader}>
                    <h4>Education #{i + 1}</h4>
                    {form.education.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removeArrayItem('education', i)}>✕ Remove</button>
                    )}
                  </div>
                  <div className={styles.formGrid}>
                    <Input label="Degree" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} placeholder="B.S. Computer Science" />
                    <Input label="School" value={edu.school} onChange={e => updateArrayItem('education', i, 'school', e.target.value)} placeholder="University Name" />
                    <Input label="Location" value={edu.location} onChange={e => updateArrayItem('education', i, 'location', e.target.value)} placeholder="City, State" />
                    <Input label="Graduation Date" value={edu.graduationDate} onChange={e => updateArrayItem('education', i, 'graduationDate', e.target.value)} placeholder="May 2025" />
                    <Input label="GPA" value={edu.gpa} onChange={e => updateArrayItem('education', i, 'gpa', e.target.value)} placeholder="3.8/4.0" />
                  </div>
                </div>
              ))}
              <Button variant="ghost" onClick={() => addArrayItem('education', { degree: '', school: '', location: '', graduationDate: '', gpa: '' })}>+ Add Education</Button>
              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
                <Button onClick={() => { saveProfile(); setStep(2); }}>Save & Continue →</Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className={styles.formCard} hover={false}>
              <h2>Experience</h2>
              {form.experience.map((exp, i) => (
                <div key={i} className={styles.arrayItem}>
                  <div className={styles.arrayHeader}>
                    <h4>Experience #{i + 1}</h4>
                    {form.experience.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removeArrayItem('experience', i)}>✕ Remove</button>
                    )}
                  </div>
                  <div className={styles.formGrid}>
                    <Input label="Job Title" value={exp.title} onChange={e => updateArrayItem('experience', i, 'title', e.target.value)} placeholder="Software Engineer Intern" />
                    <Input label="Company" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} placeholder="Company Name" />
                    <Input label="Location" value={exp.location} onChange={e => updateArrayItem('experience', i, 'location', e.target.value)} placeholder="City, State" />
                    <Input label="Start Date" value={exp.startDate} onChange={e => updateArrayItem('experience', i, 'startDate', e.target.value)} placeholder="Jun 2024" />
                    <Input label="End Date" value={exp.endDate} onChange={e => updateArrayItem('experience', i, 'endDate', e.target.value)} placeholder="Present" />
                  </div>
                  <Input label="Description" textarea value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} />
                </div>
              ))}
              <Button variant="ghost" onClick={() => addArrayItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}>+ Add Experience</Button>
              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => { saveProfile(); setStep(3); }}>Save & Continue →</Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className={styles.formCard} hover={false}>
              <h2>Skills & Projects</h2>

              {/* Skills */}
              <div className={styles.skillsSection}>
                <h3>Skills</h3>
                <div className={styles.skillInput}>
                  <Input label="Add a skill" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    placeholder="e.g. React, Python, SQL..."
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <Button variant="secondary" size="sm" onClick={addSkill}>Add</Button>
                </div>
                <div className={styles.skillTags}>
                  {form.skills.map((skill, i) => (
                    <span key={i} className={styles.skillTag}>
                      {skill}
                      <button onClick={() => removeSkill(skill)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <h3 style={{ marginTop: '32px' }}>Projects</h3>
              {form.projects.map((proj, i) => (
                <div key={i} className={styles.arrayItem}>
                  <div className={styles.arrayHeader}>
                    <h4>Project #{i + 1}</h4>
                    {form.projects.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removeArrayItem('projects', i)}>✕ Remove</button>
                    )}
                  </div>
                  <div className={styles.formGrid}>
                    <Input label="Project Name" value={proj.name} onChange={e => updateArrayItem('projects', i, 'name', e.target.value)} placeholder="My Awesome Project" />
                    <Input label="Technologies" value={proj.technologies} onChange={e => updateArrayItem('projects', i, 'technologies', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
                  </div>
                  <Input label="Description" textarea value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} placeholder="What does it do? What was your role?" rows={3} />
                </div>
              ))}
              <Button variant="ghost" onClick={() => addArrayItem('projects', { name: '', description: '', technologies: '' })}>+ Add Project</Button>

              <div className={styles.generateSection}>
                <h3>Ready to Generate?</h3>
                <Input label="Target Role (optional)" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Frontend Developer, Data Scientist" />
                <div className={styles.formActions}>
                  <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
                  <Button onClick={handleGenerate} loading={generating} size="lg">
                    🤖 Generate Resume with AI
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 4 && resume && (
            <div className={styles.resultSection}>
              <Card className={styles.resultCard} hover={false}>
                <div className={styles.resultHeader}>
                  <div>
                    <h2>Your Resume is Ready! 🎉</h2>
                    <p>ATS Score: <span className={styles.atsScore}>{resume.atsScore || resume.content?.atsScore || 0}%</span></p>
                  </div>
                  <div className={styles.resultActions}>
                    <Button onClick={handleDownloadPDF} icon="📥">Download PDF</Button>
                    <Button variant="secondary" onClick={() => { setResume(null); setStep(3); }}>Generate Another</Button>
                  </div>
                </div>
              </Card>

              {/* Resume Preview */}
              <Card className={styles.previewCard} hover={false}>
                <div className={styles.resumePreview}>
                  {(() => {
                    const data = resume.content || resume;
                    const info = data.personalInfo || {};
                    return (
                      <>
                        <div className={styles.previewHeader}>
                          <h2 className={styles.previewName}>{info.name}</h2>
                          <p className={styles.previewTitle}>{info.title}</p>
                          <p className={styles.previewContact}>
                            {[info.email, info.phone, info.location].filter(Boolean).join(' • ')}
                          </p>
                        </div>

                        {data.summary && (
                          <div className={styles.previewSection}>
                            <h3>Professional Summary</h3>
                            <p>{data.summary}</p>
                          </div>
                        )}

                        {data.experience?.length > 0 && (
                          <div className={styles.previewSection}>
                            <h3>Experience</h3>
                            {data.experience.map((exp, i) => (
                              <div key={i} className={styles.previewItem}>
                                <div className={styles.previewItemHeader}>
                                  <strong>{exp.title}</strong>
                                  <span>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <p className={styles.previewCompany}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                {exp.bullets?.map((b, j) => <p key={j} className={styles.previewBullet}>• {b}</p>)}
                              </div>
                            ))}
                          </div>
                        )}

                        {data.education?.length > 0 && (
                          <div className={styles.previewSection}>
                            <h3>Education</h3>
                            {data.education.map((edu, i) => (
                              <div key={i} className={styles.previewItem}>
                                <div className={styles.previewItemHeader}>
                                  <strong>{edu.degree}</strong>
                                  <span>{edu.graduationDate}</span>
                                </div>
                                <p className={styles.previewCompany}>{edu.school}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {data.skills && (
                          <div className={styles.previewSection}>
                            <h3>Skills</h3>
                            <div className={styles.previewSkills}>
                              {data.skills.technical?.map((s, i) => <span key={i} className={styles.previewSkillTag}>{s}</span>)}
                              {data.skills.tools?.map((s, i) => <span key={i} className={styles.previewSkillTag}>{s}</span>)}
                            </div>
                          </div>
                        )}

                        {data.projects?.length > 0 && (
                          <div className={styles.previewSection}>
                            <h3>Projects</h3>
                            {data.projects.map((proj, i) => (
                              <div key={i} className={styles.previewItem}>
                                <strong>{proj.name}</strong>
                                {proj.technologies?.length > 0 && (
                                  <p className={styles.previewTech}>{proj.technologies.join(' • ')}</p>
                                )}
                                {proj.bullets?.map((b, j) => <p key={j} className={styles.previewBullet}>• {b}</p>)}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
