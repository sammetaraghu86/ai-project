/**
 * OpenAI GPT-4o integration
 */
const { fillTemplate, RESUME_SYSTEM_PROMPT, RESUME_GENERATION_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT, COVER_LETTER_GENERATION_PROMPT,
  PORTFOLIO_SYSTEM_PROMPT, PORTFOLIO_GENERATION_PROMPT } = require('./prompts');

class OpenAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o';
  }

  async chat(systemPrompt, userPrompt) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateResume(profile, targetRole) {
    const prompt = fillTemplate(RESUME_GENERATION_PROMPT, {
      profile: JSON.stringify(profile, null, 2),
      targetRole: targetRole || 'Software Developer'
    });
    const result = await this.chat(RESUME_SYSTEM_PROMPT, prompt);
    return JSON.parse(result);
  }

  async generateCoverLetter(profile, jobTitle, company, jobDescription, tone) {
    const systemPrompt = fillTemplate(COVER_LETTER_SYSTEM_PROMPT, { tone });
    const prompt = fillTemplate(COVER_LETTER_GENERATION_PROMPT, {
      profile: JSON.stringify(profile, null, 2),
      jobTitle, company,
      jobDescription: jobDescription || 'Not provided',
      tone
    });
    const result = await this.chat(systemPrompt, prompt);
    // Cover letter might be returned as JSON or plain text
    try {
      const parsed = JSON.parse(result);
      return parsed.coverLetter || parsed.content || result;
    } catch {
      return result;
    }
  }

  async generatePortfolio(profile) {
    const prompt = fillTemplate(PORTFOLIO_GENERATION_PROMPT, {
      profile: JSON.stringify(profile, null, 2)
    });
    const result = await this.chat(PORTFOLIO_SYSTEM_PROMPT, prompt);
    return JSON.parse(result);
  }
}

module.exports = OpenAIProvider;
