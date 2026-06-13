/**
 * API client for the backend
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || error.errors?.join(', ') || `HTTP ${response.status}`);
    }

    // Handle PDF/binary responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return response.blob();
    }
    if (contentType && contentType.includes('text/html')) {
      return response.text();
    }

    return response.json();
  }

  // Auth
  async register(name, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // Profile
  async getProfile() {
    return this.request('/profiles/me');
  }

  async updateProfile(data) {
    return this.request('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getProfileCompletion() {
    return this.request('/profiles/completion');
  }

  // Resumes
  async generateResume(targetRole, templateType) {
    return this.request('/resumes/generate', {
      method: 'POST',
      body: JSON.stringify({ targetRole, templateType })
    });
  }

  async listResumes() {
    return this.request('/resumes');
  }

  async getResume(id) {
    return this.request(`/resumes/${id}`);
  }

  async downloadResumePDF(id) {
    return this.request(`/resumes/${id}/pdf`);
  }

  async deleteResume(id) {
    return this.request(`/resumes/${id}`, { method: 'DELETE' });
  }

  // Cover Letters
  async generateCoverLetter(jobTitle, company, jobDescription, tone) {
    return this.request('/cover-letters/generate', {
      method: 'POST',
      body: JSON.stringify({ jobTitle, company, jobDescription, tone })
    });
  }

  async listCoverLetters() {
    return this.request('/cover-letters');
  }

  async getCoverLetter(id) {
    return this.request(`/cover-letters/${id}`);
  }

  async downloadCoverLetterPDF(id) {
    return this.request(`/cover-letters/${id}/pdf`);
  }

  async deleteCoverLetter(id) {
    return this.request(`/cover-letters/${id}`, { method: 'DELETE' });
  }

  // Portfolios
  async generatePortfolio(theme, title) {
    return this.request('/portfolios/generate', {
      method: 'POST',
      body: JSON.stringify({ theme, title })
    });
  }

  async listPortfolios() {
    return this.request('/portfolios');
  }

  async getPortfolio(id) {
    return this.request(`/portfolios/${id}`);
  }

  async downloadPortfolioHTML(id) {
    return this.request(`/portfolios/${id}/html`);
  }

  async deletePortfolio(id) {
    return this.request(`/portfolios/${id}`, { method: 'DELETE' });
  }
}

const api = new ApiClient();
export default api;
