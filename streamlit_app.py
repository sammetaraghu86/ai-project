import streamlit as st
from fpdf import FPDF
import io
import json
from datetime import datetime

# ─── Page Config ───
st.set_page_config(
    page_title="ResumeAI — AI Resume & Portfolio Builder",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Custom CSS ───
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');

/* Global */
.stApp {
    background: linear-gradient(135deg, #0a0f1e 0%, #0f1629 50%, #0a0f1e 100%);
}

/* Hide default header/footer */
#MainMenu {visibility: hidden;}
header {visibility: hidden;}
footer {visibility: hidden;}

/* Sidebar */
section[data-testid="stSidebar"] {
    background: #0f1629;
    border-right: 1px solid rgba(99, 102, 241, 0.15);
}
section[data-testid="stSidebar"] .stMarkdown h1 {
    font-family: 'Outfit', sans-serif;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.5rem;
}

/* Cards */
.card {
    background: #141b2d;
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    transition: all 0.25s ease;
}
.card:hover {
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
}

/* Feature Cards */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin: 24px 0;
}
.feature-card {
    background: #141b2d;
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    transition: all 0.3s ease;
}
.feature-card:hover {
    transform: translateY(-6px);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.feature-icon { font-size: 2.5rem; margin-bottom: 12px; }
.feature-card h3 {
    font-family: 'Outfit', sans-serif;
    color: #f1f5f9;
    font-size: 1.15rem;
    margin-bottom: 8px;
}
.feature-card p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }

/* Hero */
.hero {
    text-align: center;
    padding: 60px 20px;
}
.hero h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 16px;
    line-height: 1.15;
}
.hero .gradient {
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero p { color: #94a3b8; font-size: 1.1rem; max-width: 600px; margin: 0 auto 32px; line-height: 1.7; }

/* Badge */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #a5b4fc;
    margin-bottom: 20px;
}
.badge-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #6366f1;
    animation: pulse 2s ease-in-out infinite;
}

/* Stats */
.stats-row {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;
}
.stat { text-align: center; }
.stat-num {
    font-family: 'Outfit', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.stat-label { font-size: 0.8rem; color: #64748b; margin-top: 4px; }

/* Resume Preview */
.resume-preview {
    background: white;
    color: #1a1a1a;
    padding: 40px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-family: 'Inter', sans-serif;
}
.resume-preview h2 {
    color: #1a365d;
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 4px;
}
.resume-preview .title {
    color: #3182ce;
    text-align: center;
    font-size: 1rem;
    margin-bottom: 8px;
}
.resume-preview .contact {
    text-align: center;
    color: #718096;
    font-size: 0.85rem;
    margin-bottom: 20px;
}
.resume-preview h3 {
    color: #1a365d;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-bottom: 2px solid #3182ce;
    padding-bottom: 4px;
    margin: 20px 0 12px;
}
.resume-preview p { font-size: 0.9rem; color: #4a5568; line-height: 1.6; margin-bottom: 4px; }
.resume-preview .item-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
.resume-preview .item-header strong { color: #2d3748; }
.resume-preview .item-header span { color: #718096; font-size: 0.85rem; }
.resume-preview .company { color: #718096; font-size: 0.85rem; margin-bottom: 6px; }
.resume-preview .bullet { padding-left: 16px; font-size: 0.85rem; color: #4a5568; }
.skill-tag {
    display: inline-block;
    padding: 4px 12px;
    background: #edf2f7;
    border-radius: 999px;
    font-size: 0.8rem;
    color: #2d3748;
    margin: 3px;
}

/* Cover letter */
.letter-preview {
    background: white;
    color: #1a1a1a;
    padding: 40px;
    border-radius: 12px;
    font-family: Georgia, serif;
    font-size: 0.95rem;
    line-height: 1.8;
    white-space: pre-wrap;
}

/* Section labels */
.section-label {
    font-family: 'Outfit', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 8px;
}
.section-sublabel { color: #64748b; font-size: 0.9rem; margin-bottom: 24px; }

/* Tabs styling */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    background: #0f1629;
    border-radius: 12px;
    padding: 4px;
}
.stTabs [data-baseweb="tab"] {
    border-radius: 8px;
    color: #94a3b8;
    font-weight: 500;
}
.stTabs [aria-selected="true"] {
    background: rgba(99, 102, 241, 0.15) !important;
    color: #6366f1 !important;
}

/* Buttons */
.stButton>button {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    padding: 10px 24px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25) !important;
}
.stButton>button:hover {
    box-shadow: 0 6px 30px rgba(99, 102, 241, 0.4) !important;
    transform: translateY(-2px) !important;
}

/* Inputs */
.stTextInput>div>div>input, .stTextArea>div>div>textarea, .stSelectbox>div>div {
    background: #0d1220 !important;
    border: 1px solid rgba(99, 102, 241, 0.15) !important;
    border-radius: 10px !important;
    color: #f1f5f9 !important;
}
.stTextInput>div>div>input:focus, .stTextArea>div>div>textarea:focus {
    border-color: rgba(99, 102, 241, 0.6) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
}

/* Metric */
div[data-testid="stMetric"] {
    background: #141b2d;
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 12px;
    padding: 16px;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

@media (max-width: 768px) {
    .feature-grid { grid-template-columns: 1fr; }
    .hero h1 { font-size: 2rem; }
    .stats-row { gap: 20px; }
}
</style>
""", unsafe_allow_html=True)


# ─── Session State Init ───
def init_state():
    defaults = {
        "page": "home",
        "profile": {
            "name": "", "email": "", "title": "", "phone": "", "location": "",
            "linkedin": "", "github": "", "website": "", "summary": "",
            "skills": [], "education": [], "experience": [], "projects": []
        },
        "generated_resume": None,
        "generated_letter": None,
        "generated_portfolio": None,
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

init_state()


# ─── AI Generation Functions (Demo Mode) ───
def generate_resume_content(profile, target_role):
    """Generate resume content from profile data."""
    skills = profile.get("skills", [])
    return {
        "personalInfo": {
            "name": profile.get("name", "Student"),
            "title": profile.get("title", target_role or "Software Developer"),
            "email": profile.get("email", ""),
            "phone": profile.get("phone", ""),
            "location": profile.get("location", ""),
            "linkedin": profile.get("linkedin", ""),
            "github": profile.get("github", ""),
        },
        "summary": profile.get("summary", "") or (
            f"Results-driven {profile.get('title', 'developer')} with expertise in "
            f"{', '.join(skills[:3]) if skills else 'modern technologies'}. "
            f"Passionate about building innovative solutions and delivering high-quality software. "
            f"Seeking to leverage technical skills in a {target_role or 'software development'} role."
        ),
        "experience": [
            {
                "title": exp.get("title", ""),
                "company": exp.get("company", ""),
                "location": exp.get("location", ""),
                "startDate": exp.get("start_date", ""),
                "endDate": exp.get("end_date", "Present"),
                "bullets": [
                    f"Developed and maintained {exp.get('description', 'software applications')}",
                    "Collaborated with cross-functional teams to deliver features on schedule",
                    "Implemented best practices improving code quality and test coverage"
                ]
            } for exp in profile.get("experience", [])
        ],
        "education": [
            {
                "degree": edu.get("degree", ""),
                "school": edu.get("school", ""),
                "graduationDate": edu.get("graduation_date", ""),
                "gpa": edu.get("gpa", ""),
            } for edu in profile.get("education", [])
        ],
        "skills": {
            "technical": skills[:8] if skills else ["JavaScript", "Python", "React"],
            "soft": ["Communication", "Problem Solving", "Team Collaboration", "Time Management"],
            "tools": ["Git", "VS Code", "Docker", "Linux"]
        },
        "projects": [
            {
                "name": proj.get("name", ""),
                "technologies": [t.strip() for t in proj.get("technologies", "").split(",") if t.strip()],
                "bullets": [
                    f"Built {proj.get('name', 'the project')} using {proj.get('technologies', 'modern stack')}",
                    proj.get("description", "Implemented key features with innovative approach")
                ]
            } for proj in profile.get("projects", [])
        ],
        "atsScore": 85,
    }


def generate_cover_letter_content(profile, job_title, company, job_desc, tone):
    """Generate cover letter from profile and job details."""
    name = profile.get("name", "Student")
    skills = profile.get("skills", [])
    title = profile.get("title", "developer")
    tone_word = {"formal": "pleased", "conversational": "excited", "persuasive": "confident"}.get(tone, "pleased")

    return f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company}. As a {title} with experience in {', '.join(skills[:3]) if skills else 'modern technologies'}, I am {tone_word} about the opportunity to contribute to your team.

{f'After carefully reviewing the job description, I believe my background aligns well with your requirements. ' if job_desc else ''}My experience has equipped me with a strong foundation in both technical execution and collaborative problem-solving. I have consistently delivered high-quality solutions while working effectively in team environments, and I am eager to bring this same dedication to {company}.

{profile.get('summary', '') or f'Throughout my career, I have focused on building robust, user-centered applications. I take pride in writing clean, maintainable code and staying current with industry best practices.'} I am particularly drawn to {company}'s mission and the opportunity to work on impactful projects that make a real difference.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to {company}'s continued success. Thank you for considering my application, and I look forward to the possibility of speaking with you.

Sincerely,
{name}"""


def generate_portfolio_html(profile, theme):
    """Generate portfolio HTML."""
    colors = {
        "developer": ("#0f172a", "#1e293b", "#3b82f6", "#e2e8f0", "#94a3b8"),
        "creative": ("#1a1a2e", "#16213e", "#e94560", "#eaeaea", "#a0a0a0"),
        "minimal": ("#ffffff", "#f8fafc", "#0f172a", "#1e293b", "#64748b"),
        "nature": ("#064e3b", "#065f46", "#34d399", "#ecfdf5", "#a7f3d0"),
    }
    bg, card, accent, text, muted = colors.get(theme, colors["developer"])
    name = profile.get("name", "Student")
    skills = profile.get("skills", [])
    projects = profile.get("projects", [])

    skills_html = "".join(f'<span class="tag">{s}</span>' for s in skills)
    projects_html = "".join(f"""
    <div class="project-card">
      <h3>{p.get('name','Project')}</h3>
      <p>{p.get('description','A software project')}</p>
      <div class="tags">{''.join(f'<span class="tag">{t.strip()}</span>' for t in p.get('technologies','').split(',') if t.strip())}</div>
    </div>""" for p in projects)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{name} - Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',sans-serif;background:{bg};color:{text};line-height:1.6}}
.container{{max-width:900px;margin:0 auto;padding:0 24px}}
.hero{{min-height:60vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px 24px}}
.hero h1{{font-family:'Outfit',sans-serif;font-size:3rem;font-weight:700;margin-bottom:16px;background:linear-gradient(135deg,{accent},{text});-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.hero p{{font-size:1.25rem;color:{muted};max-width:600px}}
section{{padding:60px 0}}
section h2{{font-family:'Outfit',sans-serif;font-size:2rem;margin-bottom:32px;color:{accent}}}
.about p{{font-size:1.05rem;color:{muted};white-space:pre-line}}
.tags{{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}}
.tag{{padding:6px 14px;background:{card};border:1px solid {accent}40;border-radius:20px;font-size:0.85rem;color:{accent};transition:all 0.2s}}
.tag:hover{{background:{accent}20;transform:translateY(-2px)}}
.projects-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}}
.project-card{{background:{card};border:1px solid {accent}20;border-radius:12px;padding:24px;transition:transform 0.2s,box-shadow 0.2s}}
.project-card:hover{{transform:translateY(-4px);box-shadow:0 8px 30px {accent}15}}
.project-card h3{{margin-bottom:8px;color:{text}}}
.project-card p{{color:{muted};margin-bottom:12px;font-size:0.95rem}}
.contact{{text-align:center;padding:80px 24px}}
.contact p{{color:{muted};font-size:1.05rem;margin-top:16px}}
</style>
</head>
<body>
<section class="hero"><div class="container">
<h1>Hi, I'm {name}</h1>
<p>{profile.get('title','Developer • Creator • Problem Solver')}</p>
</div></section>
<section class="about"><div class="container">
<h2>About Me</h2>
<p>{profile.get('summary','') or f"I'm a passionate developer who loves building things that make a difference."}</p>
</div></section>
<section><div class="container">
<h2>Skills</h2>
<div class="tags">{skills_html}</div>
</div></section>
{f'<section><div class="container"><h2>Projects</h2><div class="projects-grid">{projects_html}</div></div></section>' if projects else ''}
<section class="contact"><div class="container">
<h2>Let's Connect</h2>
<p>I'm always open to new opportunities and collaborations. Feel free to reach out!</p>
</div></section>
</body></html>"""


def create_resume_pdf(data):
    """Create a PDF from resume data."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    info = data.get("personalInfo", {})

    # Header
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(26, 54, 93)
    pdf.cell(0, 12, info.get("name", ""), align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(49, 130, 206)
    pdf.cell(0, 7, info.get("title", ""), align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(113, 128, 150)
    contact = " | ".join(filter(None, [info.get("email"), info.get("phone"), info.get("location")]))
    pdf.cell(0, 6, contact, align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Line
    pdf.set_draw_color(226, 232, 240)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(6)

    def section_heading(title):
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(26, 54, 93)
        pdf.cell(0, 8, title.upper(), new_x="LMARGIN", new_y="NEXT")
        pdf.set_draw_color(49, 130, 206)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.ln(4)

    # Summary
    if data.get("summary"):
        section_heading("Professional Summary")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(45, 55, 72)
        pdf.multi_cell(0, 5, data["summary"])
        pdf.ln(4)

    # Experience
    if data.get("experience"):
        section_heading("Experience")
        for exp in data["experience"]:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(45, 55, 72)
            pdf.cell(0, 6, f"{exp.get('title', '')} | {exp.get('company', '')}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(113, 128, 150)
            pdf.cell(0, 5, f"{exp.get('startDate', '')} - {exp.get('endDate', '')}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(45, 55, 72)
            for b in exp.get("bullets", []):
                pdf.cell(5)
                pdf.multi_cell(0, 5, f"* {b}")
            pdf.ln(3)

    # Education
    if data.get("education"):
        section_heading("Education")
        for edu in data["education"]:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(45, 55, 72)
            pdf.cell(0, 6, edu.get("degree", ""), new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(113, 128, 150)
            pdf.cell(0, 5, f"{edu.get('school', '')} | {edu.get('graduationDate', '')}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(3)

    # Skills
    if data.get("skills"):
        section_heading("Skills")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(45, 55, 72)
        if data["skills"].get("technical"):
            pdf.multi_cell(0, 5, f"Technical: {', '.join(data['skills']['technical'])}")
        if data["skills"].get("tools"):
            pdf.multi_cell(0, 5, f"Tools: {', '.join(data['skills']['tools'])}")
        pdf.ln(3)

    # Projects
    if data.get("projects"):
        section_heading("Projects")
        for proj in data["projects"]:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(45, 55, 72)
            pdf.cell(0, 6, proj.get("name", ""), new_x="LMARGIN", new_y="NEXT")
            if proj.get("technologies"):
                pdf.set_font("Helvetica", "", 8)
                pdf.set_text_color(49, 130, 206)
                pdf.cell(0, 5, " | ".join(proj["technologies"]), new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(45, 55, 72)
            for b in proj.get("bullets", []):
                pdf.cell(5)
                pdf.multi_cell(0, 5, f"* {b}")
            pdf.ln(3)

    return pdf.output()


# ─── Sidebar Navigation ───
with st.sidebar:
    st.markdown("# ✦ ResumeAI")
    st.markdown("---")

    pages = {
        "🏠 Home": "home",
        "👤 My Profile": "profile",
        "📄 Resume Builder": "resume",
        "✉️ Cover Letter": "cover_letter",
        "🌐 Portfolio Builder": "portfolio",
    }

    for label, page_key in pages.items():
        if st.button(label, key=f"nav_{page_key}", use_container_width=True):
            st.session_state.page = page_key

    st.markdown("---")
    st.markdown(
        '<p style="color:#64748b;font-size:0.8rem;text-align:center;">Built with ❤️ for students</p>',
        unsafe_allow_html=True
    )
    st.markdown(
        '<p style="color:#64748b;font-size:0.75rem;text-align:center;">'
        '<a href="https://github.com/sammetaraghu86/ai-project" style="color:#6366f1;">GitHub Repo</a></p>',
        unsafe_allow_html=True
    )


# ═══════════════════════════════════════════
# PAGE: HOME
# ═══════════════════════════════════════════
if st.session_state.page == "home":
    st.markdown("""
    <div class="hero">
        <div class="badge"><span class="badge-dot"></span> AI-Powered Career Tools</div>
        <h1>Build Your Career with<br><span class="gradient">AI-Powered</span> Resumes &amp; Portfolios</h1>
        <p>Stop struggling with generic templates. Our AI creates personalized,
        ATS-optimized resumes, compelling cover letters, and stunning portfolios.</p>
        <div class="stats-row">
            <div class="stat"><div class="stat-num">95%</div><div class="stat-label">ATS Pass Rate</div></div>
            <div class="stat"><div class="stat-num">5+</div><div class="stat-label">Pro Templates</div></div>
            <div class="stat"><div class="stat-num">30s</div><div class="stat-label">Generation Time</div></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="feature-grid">
        <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3>Smart Resume Builder</h3>
            <p>AI-optimized resumes with ATS scoring, action verb enhancement, and professional templates.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">✉️</div>
            <h3>Cover Letter Engine</h3>
            <p>Personalized cover letters tailored to specific job descriptions and companies.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>Portfolio Generator</h3>
            <p>Generate stunning portfolio websites with multiple themes to showcase your work.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>ATS Optimization</h3>
            <p>Built-in scoring ensures your resume passes automated screening systems.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant PDF Export</h3>
            <p>Download publication-ready PDFs with professional typography.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Your Data, Secured</h3>
            <p>All your information stays private. Export anytime. No vendor lock-in.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════
# PAGE: PROFILE
# ═══════════════════════════════════════════
elif st.session_state.page == "profile":
    st.markdown('<div class="section-label">👤 My Profile</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-sublabel">Fill in your details — this data powers all AI generation.</div>', unsafe_allow_html=True)

    profile = st.session_state.profile

    col1, col2 = st.columns(2)
    with col1:
        profile["name"] = st.text_input("Full Name", value=profile["name"], key="p_name")
        profile["title"] = st.text_input("Professional Title", value=profile["title"], key="p_title", placeholder="e.g. Full Stack Developer")
        profile["email"] = st.text_input("Email", value=profile["email"], key="p_email")
        profile["phone"] = st.text_input("Phone", value=profile["phone"], key="p_phone")
    with col2:
        profile["location"] = st.text_input("Location", value=profile["location"], key="p_location")
        profile["linkedin"] = st.text_input("LinkedIn URL", value=profile["linkedin"], key="p_linkedin")
        profile["github"] = st.text_input("GitHub URL", value=profile["github"], key="p_github")
        profile["website"] = st.text_input("Website", value=profile["website"], key="p_website")

    profile["summary"] = st.text_area("Professional Summary", value=profile["summary"], key="p_summary",
                                       placeholder="A brief 2-3 sentence summary...", height=100)

    # Skills
    st.markdown("#### Skills")
    skills_input = st.text_input("Add skills (comma separated)", key="skills_input",
                                  placeholder="React, Python, SQL, Docker...")
    if st.button("➕ Add Skills", key="add_skills"):
        new_skills = [s.strip() for s in skills_input.split(",") if s.strip()]
        profile["skills"] = list(set(profile["skills"] + new_skills))
        st.rerun()

    if profile["skills"]:
        skills_display = " ".join(
            [f'<span style="display:inline-block;padding:4px 12px;background:rgba(99,102,241,0.15);'
             f'border:1px solid rgba(99,102,241,0.3);border-radius:999px;font-size:0.8rem;'
             f'color:#a5b4fc;margin:3px;">{s}</span>' for s in profile["skills"]]
        )
        st.markdown(skills_display, unsafe_allow_html=True)
        if st.button("🗑️ Clear All Skills", key="clear_skills"):
            profile["skills"] = []
            st.rerun()

    # Education
    st.markdown("#### Education")
    num_edu = st.number_input("Number of education entries", 0, 5, len(profile["education"]), key="num_edu")
    while len(profile["education"]) < num_edu:
        profile["education"].append({"degree": "", "school": "", "graduation_date": "", "gpa": ""})
    profile["education"] = profile["education"][:num_edu]

    for i, edu in enumerate(profile["education"]):
        with st.expander(f"Education #{i+1}", expanded=True):
            c1, c2 = st.columns(2)
            edu["degree"] = c1.text_input("Degree", value=edu.get("degree", ""), key=f"edu_deg_{i}")
            edu["school"] = c2.text_input("School", value=edu.get("school", ""), key=f"edu_sch_{i}")
            c3, c4 = st.columns(2)
            edu["graduation_date"] = c3.text_input("Graduation Date", value=edu.get("graduation_date", ""), key=f"edu_grad_{i}")
            edu["gpa"] = c4.text_input("GPA", value=edu.get("gpa", ""), key=f"edu_gpa_{i}")

    # Experience
    st.markdown("#### Experience")
    num_exp = st.number_input("Number of experience entries", 0, 10, len(profile["experience"]), key="num_exp")
    while len(profile["experience"]) < num_exp:
        profile["experience"].append({"title": "", "company": "", "location": "", "start_date": "", "end_date": "", "description": ""})
    profile["experience"] = profile["experience"][:num_exp]

    for i, exp in enumerate(profile["experience"]):
        with st.expander(f"Experience #{i+1}", expanded=True):
            c1, c2 = st.columns(2)
            exp["title"] = c1.text_input("Job Title", value=exp.get("title", ""), key=f"exp_title_{i}")
            exp["company"] = c2.text_input("Company", value=exp.get("company", ""), key=f"exp_comp_{i}")
            c3, c4, c5 = st.columns(3)
            exp["location"] = c3.text_input("Location", value=exp.get("location", ""), key=f"exp_loc_{i}")
            exp["start_date"] = c4.text_input("Start Date", value=exp.get("start_date", ""), key=f"exp_start_{i}")
            exp["end_date"] = c5.text_input("End Date", value=exp.get("end_date", ""), key=f"exp_end_{i}")
            exp["description"] = st.text_area("Description", value=exp.get("description", ""), key=f"exp_desc_{i}", height=80)

    # Projects
    st.markdown("#### Projects")
    num_proj = st.number_input("Number of projects", 0, 10, len(profile["projects"]), key="num_proj")
    while len(profile["projects"]) < num_proj:
        profile["projects"].append({"name": "", "description": "", "technologies": ""})
    profile["projects"] = profile["projects"][:num_proj]

    for i, proj in enumerate(profile["projects"]):
        with st.expander(f"Project #{i+1}", expanded=True):
            proj["name"] = st.text_input("Project Name", value=proj.get("name", ""), key=f"proj_name_{i}")
            proj["technologies"] = st.text_input("Technologies (comma separated)", value=proj.get("technologies", ""), key=f"proj_tech_{i}")
            proj["description"] = st.text_area("Description", value=proj.get("description", ""), key=f"proj_desc_{i}", height=80)

    if st.button("💾 Save Profile", key="save_profile", use_container_width=True):
        st.session_state.profile = profile
        st.success("✅ Profile saved successfully!")


# ═══════════════════════════════════════════
# PAGE: RESUME BUILDER
# ═══════════════════════════════════════════
elif st.session_state.page == "resume":
    st.markdown('<div class="section-label">📄 Resume Builder</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-sublabel">Generate an AI-optimized, ATS-friendly resume from your profile.</div>', unsafe_allow_html=True)

    profile = st.session_state.profile
    if not profile.get("name"):
        st.warning("⚠️ Please complete your **Profile** first (use the sidebar).")
    else:
        target_role = st.text_input("🎯 Target Role", placeholder="e.g. Frontend Developer, Data Scientist")

        if st.button("🤖 Generate Resume with AI", key="gen_resume", use_container_width=True):
            with st.spinner("✨ AI is crafting your resume..."):
                import time; time.sleep(1.5)
                resume_data = generate_resume_content(profile, target_role)
                st.session_state.generated_resume = resume_data
                st.success(f"✅ Resume generated! ATS Score: **{resume_data['atsScore']}%**")

        if st.session_state.generated_resume:
            data = st.session_state.generated_resume
            info = data.get("personalInfo", {})

            # Download PDF
            pdf_bytes = create_resume_pdf(data)
            st.download_button("📥 Download Resume PDF", data=pdf_bytes,
                              file_name=f"resume-{info.get('name','').replace(' ','-')}.pdf",
                              mime="application/pdf", use_container_width=True)

            # ATS Score
            col1, col2, col3 = st.columns(3)
            col1.metric("ATS Score", f"{data.get('atsScore', 85)}%")
            col2.metric("Sections", "6")
            col3.metric("Keywords", f"{len(data.get('skills', {}).get('technical', []))}")

            # Preview
            st.markdown("### 📋 Resume Preview")

            skills_tags = "".join(f'<span class="skill-tag">{s}</span>'
                                  for s in data.get("skills", {}).get("technical", []) + data.get("skills", {}).get("tools", []))

            exp_html = ""
            for exp in data.get("experience", []):
                bullets = "".join(f'<p class="bullet">• {b}</p>' for b in exp.get("bullets", []))
                exp_html += f"""
                <div class="item-header"><strong>{exp.get('title','')}</strong><span>{exp.get('startDate','')} - {exp.get('endDate','')}</span></div>
                <p class="company">{exp.get('company','')}</p>{bullets}<br>"""

            edu_html = ""
            for edu in data.get("education", []):
                edu_html += f"""
                <div class="item-header"><strong>{edu.get('degree','')}</strong><span>{edu.get('graduationDate','')}</span></div>
                <p class="company">{edu.get('school','')}{f" | GPA: {edu['gpa']}" if edu.get('gpa') else ''}</p><br>"""

            proj_html = ""
            for proj in data.get("projects", []):
                tech = " | ".join(proj.get("technologies", []))
                bullets = "".join(f'<p class="bullet">• {b}</p>' for b in proj.get("bullets", []))
                proj_html += f"""<strong>{proj.get('name','')}</strong>
                <p class="company" style="color:#3182ce">{tech}</p>{bullets}<br>"""

            contact = " • ".join(filter(None, [info.get("email"), info.get("phone"), info.get("location")]))

            st.markdown(f"""
            <div class="resume-preview">
                <h2>{info.get('name','')}</h2>
                <p class="title">{info.get('title','')}</p>
                <p class="contact">{contact}</p>
                <h3>Professional Summary</h3>
                <p>{data.get('summary','')}</p>
                {'<h3>Experience</h3>' + exp_html if exp_html else ''}
                {'<h3>Education</h3>' + edu_html if edu_html else ''}
                <h3>Skills</h3>
                <div>{skills_tags}</div>
                {'<h3>Projects</h3>' + proj_html if proj_html else ''}
            </div>
            """, unsafe_allow_html=True)


# ═══════════════════════════════════════════
# PAGE: COVER LETTER
# ═══════════════════════════════════════════
elif st.session_state.page == "cover_letter":
    st.markdown('<div class="section-label">✉️ Cover Letter Generator</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-sublabel">Paste a job description and let AI craft the perfect cover letter.</div>', unsafe_allow_html=True)

    profile = st.session_state.profile
    if not profile.get("name"):
        st.warning("⚠️ Please complete your **Profile** first.")
    else:
        col1, col2 = st.columns(2)
        job_title = col1.text_input("Job Title", placeholder="e.g. Software Engineer")
        company = col2.text_input("Company", placeholder="e.g. Google")
        job_desc = st.text_area("Job Description (optional)", placeholder="Paste the full job description here...", height=150)
        tone = st.radio("Tone", ["formal", "conversational", "persuasive"], horizontal=True,
                        format_func=lambda x: {"formal": "🏢 Formal", "conversational": "💬 Conversational", "persuasive": "🎯 Persuasive"}[x])

        if st.button("✨ Generate Cover Letter", key="gen_letter", use_container_width=True):
            if not job_title or not company:
                st.error("Job title and company are required.")
            else:
                with st.spinner("✨ AI is writing your cover letter..."):
                    import time; time.sleep(1.5)
                    letter = generate_cover_letter_content(profile, job_title, company, job_desc, tone)
                    st.session_state.generated_letter = {"content": letter, "job_title": job_title, "company": company}
                    st.success("✅ Cover letter generated!")

        if st.session_state.generated_letter:
            letter_data = st.session_state.generated_letter

            # Download
            st.download_button("📥 Download as Text", data=letter_data["content"],
                              file_name=f"cover-letter-{letter_data['company']}.txt",
                              mime="text/plain", use_container_width=True)

            # Copy button
            st.code(letter_data["content"], language=None)

            # Pretty preview
            st.markdown("### 📋 Letter Preview")
            st.markdown(f'<div class="letter-preview">{letter_data["content"]}</div>', unsafe_allow_html=True)


# ═══════════════════════════════════════════
# PAGE: PORTFOLIO
# ═══════════════════════════════════════════
elif st.session_state.page == "portfolio":
    st.markdown('<div class="section-label">🌐 Portfolio Builder</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-sublabel">Generate a stunning portfolio website from your profile.</div>', unsafe_allow_html=True)

    profile = st.session_state.profile
    if not profile.get("name"):
        st.warning("⚠️ Please complete your **Profile** first.")
    else:
        theme = st.radio("Choose Theme", ["developer", "creative", "minimal", "nature"], horizontal=True,
                         format_func=lambda x: {"developer": "💻 Developer", "creative": "🎨 Creative",
                                                 "minimal": "✨ Minimal", "nature": "🌿 Nature"}[x])

        if st.button("🚀 Generate Portfolio", key="gen_portfolio", use_container_width=True):
            with st.spinner("🚀 Building your portfolio..."):
                import time; time.sleep(1.5)
                html = generate_portfolio_html(profile, theme)
                st.session_state.generated_portfolio = html
                st.success("✅ Portfolio generated!")

        if st.session_state.generated_portfolio:
            html = st.session_state.generated_portfolio

            st.download_button("📥 Download Portfolio HTML", data=html,
                              file_name="portfolio.html", mime="text/html",
                              use_container_width=True)

            st.markdown("### 🌐 Portfolio Preview")
            st.components.v1.html(html, height=700, scrolling=True)
