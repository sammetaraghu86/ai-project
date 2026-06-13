/**
 * Prompt templates for LLM-powered generation
 */

const RESUME_SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your task is to create professional, ATS-optimized resume content from student profile data.

Guidelines:
- Use strong action verbs (Led, Developed, Implemented, Designed, Optimized, etc.)
- Quantify achievements with numbers, percentages, and metrics where possible
- Keep bullet points concise (1-2 lines each)
- Focus on impact and results, not just responsibilities
- Use industry-standard terminology
- Ensure content is ATS-friendly (avoid tables, images, special characters in keywords)
- Tailor content to highlight relevant skills for the target role`;

const RESUME_GENERATION_PROMPT = `Based on the following student profile, generate an optimized professional resume in JSON format.

Student Profile:
{profile}

Target Role: {targetRole}

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "name": "...",
    "title": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "github": "...",
    "website": "..."
  },
  "summary": "A compelling 2-3 sentence professional summary",
  "experience": [
    {
      "title": "...",
      "company": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "bullets": ["Achievement-focused bullet 1", "..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "school": "...",
      "location": "...",
      "graduationDate": "...",
      "gpa": "...",
      "highlights": ["..."]
    }
  ],
  "skills": {
    "technical": ["..."],
    "soft": ["..."],
    "tools": ["..."]
  },
  "projects": [
    {
      "name": "...",
      "description": "...",
      "technologies": ["..."],
      "bullets": ["..."]
    }
  ],
  "certifications": ["..."],
  "atsScore": 85
}`;

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer. Your task is to craft compelling, personalized cover letters that connect a candidate's experience with a specific job opportunity.

Guidelines:
- Open with a strong, attention-grabbing first paragraph
- Demonstrate knowledge of the company and role
- Connect specific experiences and skills to job requirements
- Show enthusiasm and cultural fit
- End with a confident call to action
- Keep it to 3-4 paragraphs, roughly 300-400 words
- Use a {tone} tone`;

const COVER_LETTER_GENERATION_PROMPT = `Write a personalized cover letter for the following:

Candidate Profile:
{profile}

Job Details:
- Title: {jobTitle}
- Company: {company}
- Job Description: {jobDescription}

Tone: {tone}

Write the complete cover letter text. Start with "Dear Hiring Manager," and end with a professional sign-off.`;

const PORTFOLIO_SYSTEM_PROMPT = `You are a professional portfolio content writer. Create engaging, concise content for a developer/student portfolio website.

Guidelines:
- Write in first person
- Keep descriptions engaging but concise
- Highlight technical skills and project impact
- Use language appropriate for a professional audience`;

const PORTFOLIO_GENERATION_PROMPT = `Based on the following student profile, generate portfolio website content in JSON format.

Student Profile:
{profile}

Return a JSON object with this structure:
{
  "hero": {
    "headline": "A catchy one-liner",
    "subheadline": "A brief professional tagline"
  },
  "about": "A 2-3 paragraph about section written in first person",
  "skills": [
    { "category": "Frontend", "items": ["React", "CSS", "..."] },
    { "category": "Backend", "items": ["Node.js", "..."] }
  ],
  "projects": [
    {
      "name": "...",
      "description": "2-3 sentence description",
      "technologies": ["..."],
      "highlights": ["Key achievement 1", "..."]
    }
  ],
  "experience": [
    {
      "title": "...",
      "company": "...",
      "period": "...",
      "description": "Brief description of role and impact"
    }
  ],
  "contact": {
    "headline": "Let's Connect",
    "message": "A brief invitation to reach out"
  }
}`;

function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const replacement = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), replacement);
  }
  return result;
}

module.exports = {
  RESUME_SYSTEM_PROMPT,
  RESUME_GENERATION_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  COVER_LETTER_GENERATION_PROMPT,
  PORTFOLIO_SYSTEM_PROMPT,
  PORTFOLIO_GENERATION_PROMPT,
  fillTemplate
};
