const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor() {
    this.token = null;
    this.initialized = false;
    this.initializeToken();
  }

  initializeToken() {
    // Safely initialize token on client-side only
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = localStorage.getItem('auth_token');
      this.initialized = true;
    }
  }

  getToken() {
    if (!this.initialized) {
      this.initializeToken();
    }
    return this.token;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    // Retry mechanism for network issues
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Network error' }));
          
          // Handle authentication errors
          if (response.status === 401 || response.status === 403) {
            // Clear invalid token
            this.setToken(null);
            // Throw a specific authentication error
            throw new Error(error.error || 'Authentication failed');
          }
          
          // For server errors, retry
          if (response.status >= 500 && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return response.text();
      } catch (error) {
        lastError = error;
        
        // Don't retry authentication errors or client errors
        if (error.message.includes('Authentication failed') || 
            error.message.includes('400') || 
            error.message.includes('404')) {
          break;
        }
        
        // For network errors, retry with exponential backoff
        if (attempt < 3) {
          console.warn(`API request failed (attempt ${attempt}), retrying...`, error.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    console.error(`API Error (${endpoint}):`, lastError);
    throw lastError;
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
    
    if (response.token) {
      this.setToken(response.token);
      // Force a small delay to ensure token is properly stored
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      // If getting current user fails, likely authentication issue
      if (error.message === 'User not found' || error.message.includes('Authentication failed')) {
        this.setToken(null); // Clear invalid token
      }
      throw error;
    }
  }

  // Check if user has a valid token
  isAuthenticated() {
    return !!this.token;
  }

  // Clear authentication
  clearAuth() {
    this.setToken(null);
  }

  async updateUser(updates) {
    return await this.request('/auth/me', {
      method: 'PUT',
      body: updates
    });
  }

  // User methods
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  async getCandidates() {
    return await this.request('/users/candidates');
  }

  // Job methods
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    return await this.request(endpoint);
  }

  async getJob(id) {
    return await this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return await this.request('/jobs', {
      method: 'POST',
      body: jobData
    });
  }

  async updateJob(id, updates) {
    return await this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteJob(id) {
    return await this.request(`/jobs/${id}`, {
      method: 'DELETE'
    });
  }

  async getMyJobs() {
    return await this.request('/jobs/company/my-jobs');
  }

  // Application methods
  async applyToJob(jobId, applicationData) {
    return await this.request('/applications', {
      method: 'POST',
      body: {
        job_post_id: jobId,
        ...applicationData
      }
    });
  }

  async getMyApplications() {
    return await this.request('/applications/my-applications');
  }

  async getCompanyApplications() {
    return await this.request('/applications/company-applications');
  }

  async updateApplicationStatus(applicationId, status) {
    return await this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  async getApplication(id) {
    return await this.request(`/applications/${id}`);
  }

  // Challenge methods
  async getChallenges(jobId) {
    return await this.request(`/challenges/job/${jobId}`);
  }

  async getChallenge(id) {
    return await this.request(`/challenges/${id}`);
  }

  async createChallenge(challengeData) {
    return await this.request('/challenges', {
      method: 'POST',
      body: challengeData
    });
  }

  async updateChallenge(id, updates) {
    return await this.request(`/challenges/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteChallenge(id) {
    return await this.request(`/challenges/${id}`, {
      method: 'DELETE'
    });
  }

  async generateAIChallenges(params) {
    return await this.request('/challenges/generate-ai', {
      method: 'POST',
      body: params
    });
  }

  // Admin methods
  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  async getFormFields(formType) {
    const endpoint = formType ? `/admin/form-fields?form_type=${formType}` : '/admin/form-fields';
    return await this.request(endpoint);
  }

  async createFormField(fieldData) {
    return await this.request('/admin/form-fields', {
      method: 'POST',
      body: fieldData
    });
  }

  async updateFormField(id, updates) {
    return await this.request(`/admin/form-fields/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteFormField(id) {
    return await this.request(`/admin/form-fields/${id}`, {
      method: 'DELETE'
    });
  }

  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return await this.request(endpoint);
  }

  async updateUserAsAdmin(id, updates) {
    return await this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async deleteUser(id) {
    return await this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  async initFormFields() {
    return await this.request('/admin/init-form-fields', {
      method: 'POST'
    });
  }

  // Payment Methods
  async createPaymentIntent(amount, jobPostId = null, tier = 'basic') {
    return await this.request('/payments/create-payment-intent', {
      method: 'POST',
      body: { amount, jobPostId, tier }
    });
  }

  async createSubscription(priceId) {
    return await this.request('/payments/create-subscription', {
      method: 'POST',
      body: { priceId }
    });
  }

  async cancelSubscription(subscriptionId) {
    return await this.request('/payments/cancel-subscription', {
      method: 'POST',
      body: { subscriptionId }
    });
  }

  async getSubscriptionStatus() {
    return await this.request('/payments/subscription-status');
  }
}

export const apiClient = new ApiClient();
export const api = apiClient; // Export as 'api' for compatibility
export default apiClient;
