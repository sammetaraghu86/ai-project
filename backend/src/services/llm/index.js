/**
 * LLM Service — unified interface that delegates to the configured provider
 */
const OpenAIProvider = require('./openai');
const { generateDemoResume, generateDemoCoverLetter, generateDemoPortfolio } = require('./demo');

function getLLMProvider() {
  const provider = process.env.LLM_PROVIDER || 'demo';

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY);
  }

  // Default to demo mode
  return null;
}

async function generateResume(profile, targetRole) {
  const provider = getLLMProvider();
  if (provider) {
    return await provider.generateResume(profile, targetRole);
  }
  return generateDemoResume(profile, targetRole);
}

async function generateCoverLetter(profile, jobTitle, company, jobDescription, tone) {
  const provider = getLLMProvider();
  if (provider) {
    return await provider.generateCoverLetter(profile, jobTitle, company, jobDescription, tone);
  }
  return generateDemoCoverLetter(profile, jobTitle, company, jobDescription, tone);
}

async function generatePortfolio(profile) {
  const provider = getLLMProvider();
  if (provider) {
    return await provider.generatePortfolio(profile);
  }
  return generateDemoPortfolio(profile);
}

module.exports = {
  generateResume,
  generateCoverLetter,
  generatePortfolio
};
