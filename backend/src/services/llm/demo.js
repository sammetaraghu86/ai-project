/**
 * Demo LLM provider — generates realistic mock responses without requiring API keys.
 * This allows the full app to work out of the box.
 */

function generateDemoResume(profile, targetRole) {
  const name = profile.user?.name || 'Student';
  const skills = JSON.parse(profile.skills || '[]');
  const education = JSON.parse(profile.education || '[]');
  const experience = JSON.parse(profile.experience || '[]');
  const projects = JSON.parse(profile.projects || '[]');
  const certifications = JSON.parse(profile.certifications || '[]');

  return {
    personalInfo: {
      name: name,
      title: profile.title || targetRole || 'Software Developer',
      email: profile.user?.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      website: profile.website || ''
    },
    summary: profile.summary ||
      `Results-driven ${profile.title || 'software developer'} with a passion for building innovative solutions. ` +
      `Skilled in ${skills.slice(0, 3).join(', ') || 'modern technologies'} with hands-on project experience. ` +
      `Seeking to leverage technical expertise and problem-solving abilities in a ${targetRole || 'software development'} role.`,
    experience: experience.map(exp => ({
      title: exp.title || 'Software Developer',
      company: exp.company || 'Tech Company',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || 'Present',
      bullets: exp.bullets || [
        `Developed and maintained ${exp.description || 'web applications'} serving users`,
        `Collaborated with cross-functional teams to deliver features on schedule`,
        `Implemented best practices improving code quality and test coverage`
      ]
    })),
    education: education.map(edu => ({
      degree: edu.degree || 'Bachelor of Science',
      school: edu.school || 'University',
      location: edu.location || '',
      graduationDate: edu.graduationDate || '',
      gpa: edu.gpa || '',
      highlights: edu.highlights || []
    })),
    skills: {
      technical: skills.filter((_, i) => i < 8) || ['JavaScript', 'Python', 'React'],
      soft: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management'],
      tools: ['Git', 'VS Code', 'Docker', 'Linux']
    },
    projects: projects.map(proj => ({
      name: proj.name || 'Project',
      description: proj.description || 'A software project',
      technologies: proj.technologies || skills.slice(0, 3),
      bullets: proj.bullets || [
        `Designed and implemented ${proj.name || 'the application'} using ${(proj.technologies || skills.slice(0, 2)).join(', ')}`,
        `Achieved measurable impact through innovative problem-solving approach`
      ]
    })),
    certifications: certifications.map(c => typeof c === 'string' ? c : c.name || 'Certification'),
    atsScore: Math.floor(Math.random() * 15) + 75
  };
}

function generateDemoCoverLetter(profile, jobTitle, company, jobDescription, tone) {
  const name = profile.user?.name || 'Student';
  const skills = JSON.parse(profile.skills || '[]');
  const title = profile.title || 'software developer';

  const toneAdjective = tone === 'conversational' ? 'excited' : tone === 'persuasive' ? 'confident' : 'pleased';

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. As a ${title} with experience in ${skills.slice(0, 3).join(', ') || 'modern technologies'}, I am ${toneAdjective} about the opportunity to contribute to your team.

${jobDescription ? `After carefully reviewing the job description, I believe my background aligns well with your requirements. ` : ''}My experience has equipped me with a strong foundation in both technical execution and collaborative problem-solving. I have consistently delivered high-quality solutions while working effectively in team environments, and I am eager to bring this same dedication to ${company}.

${profile.summary || `Throughout my career, I have focused on building robust, user-centered applications. I take pride in writing clean, maintainable code and staying current with industry best practices.`} I am particularly drawn to ${company}'s mission and the opportunity to work on impactful projects that make a real difference.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to ${company}'s continued success. Thank you for considering my application, and I look forward to the possibility of speaking with you.

Sincerely,
${name}`;
}

function generateDemoPortfolio(profile) {
  const name = profile.user?.name || 'Student';
  const skills = JSON.parse(profile.skills || '[]');
  const projects = JSON.parse(profile.projects || '[]');
  const experience = JSON.parse(profile.experience || '[]');

  const skillCategories = [];
  if (skills.length > 0) {
    const mid = Math.ceil(skills.length / 2);
    skillCategories.push({ category: 'Primary Skills', items: skills.slice(0, mid) });
    if (skills.length > mid) {
      skillCategories.push({ category: 'Additional Skills', items: skills.slice(mid) });
    }
  } else {
    skillCategories.push({ category: 'Skills', items: ['JavaScript', 'Python', 'React', 'Node.js'] });
  }

  return {
    hero: {
      headline: `Hi, I'm ${name}`,
      subheadline: profile.title || 'Developer • Creator • Problem Solver'
    },
    about: profile.summary ||
      `I'm a passionate developer who loves building things that make a difference. ` +
      `With experience in ${skills.slice(0, 3).join(', ') || 'modern web technologies'}, ` +
      `I focus on creating clean, efficient solutions to real-world problems.\n\n` +
      `When I'm not coding, I'm constantly learning new technologies and exploring innovative ways to solve challenges.`,
    skills: skillCategories,
    projects: projects.map(p => ({
      name: p.name || 'Project',
      description: p.description || 'A software project showcasing technical skills',
      technologies: p.technologies || skills.slice(0, 3),
      highlights: p.bullets || [`Built using ${(p.technologies || []).join(', ')}`]
    })),
    experience: experience.map(e => ({
      title: e.title || 'Developer',
      company: e.company || 'Company',
      period: `${e.startDate || ''} - ${e.endDate || 'Present'}`,
      description: e.description || 'Contributed to software development projects'
    })),
    contact: {
      headline: "Let's Connect",
      message: `I'm always open to discussing new opportunities, collaborations, or just chatting about technology. Feel free to reach out!`
    }
  };
}

module.exports = {
  generateDemoResume,
  generateDemoCoverLetter,
  generateDemoPortfolio
};
