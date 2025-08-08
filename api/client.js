const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
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

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
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
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
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
export default apiClient;
