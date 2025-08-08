import apiClient from './client.js';

// User Entity
export const User = {
  async me() {
    return await apiClient.getCurrentUser();
  },

  async list() {
    const response = await apiClient.getAdminUsers();
    return response.users || response;
  },

  async update(id, data) {
    if (id === 'me') {
      return await apiClient.updateUser(data);
    }
    return await apiClient.updateUserAsAdmin(id, data);
  }
};

// UserEntity (alias for compatibility)
export const UserEntity = {
  async me() {
    return await apiClient.getCurrentUser();
  },

  async updateMyUserData(data) {
    return await apiClient.updateUser(data);
  },

  async logout() {
    return await apiClient.logout();
  }
};

// JobseekerBio Entity
export const JobseekerBio = {
  async filter(params) {
    if (params.user_id) {
      try {
        const profile = await apiClient.getUserProfile();
        return profile ? [profile] : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  },

  async create(data) {
    return await apiClient.updateUserProfile(data);
  },

  async update(id, data) {
    return await apiClient.updateUserProfile(data);
  },

  async list() {
    return await apiClient.getCandidates();
  }
};

// JobPost Entity
export const JobPost = {
  async list(params = {}) {
    const response = await apiClient.getJobs(params);
    return response.jobs || response;
  },

  async filter(params) {
    if (params.company_user_id) {
      return await apiClient.getMyJobs();
    }
    const response = await apiClient.getJobs(params);
    return response.jobs || response;
  },

  async create(data) {
    return await apiClient.createJob(data);
  },

  async update(id, data) {
    return await apiClient.updateJob(id, data);
  },

  async delete(id) {
    return await apiClient.deleteJob(id);
  },

  async findUnique(params) {
    if (params.where?.id) {
      return await apiClient.getJob(params.where.id);
    }
    return null;
  }
};

// Challenge Entity
export const Challenge = {
  async create(data) {
    return await apiClient.createChallenge(data);
  },

  async list() {
    return [];
  },

  async filter(params) {
    if (params.job_post_id) {
      return await apiClient.getChallenges(params.job_post_id);
    }
    return [];
  },

  async update(id, data) {
    return await apiClient.updateChallenge(id, data);
  },

  async delete(id) {
    return await apiClient.deleteChallenge(id);
  }
};

// AIChallengeAnswerKey Entity
export const AIChallengeAnswerKey = {
  async create(data) {
    return data;
  }
};

// JobApplication Entity
export const JobApplication = {
  async create(data) {
    return await apiClient.applyToJob(data.job_post_id, data);
  },

  async filter(params) {
    if (params.jobseeker_user_id) {
      return await apiClient.getMyApplications();
    }
    return await apiClient.getCompanyApplications();
  },

  async list() {
    return await apiClient.getCompanyApplications();
  },

  async update(id, data) {
    if (data.status) {
      return await apiClient.updateApplicationStatus(id, data.status);
    }
    return data;
  }
};

// Other entities for compatibility
export const ChallengeResponse = { async list() { return []; } };
export const BackgroundCheck = { async list() { return []; } };
export const CompanyInvite = { async list() { return []; } };
export const CompanySubscription = { async list() { return []; } };
export const JobseekerSubscription = { async list() { return []; } };
export const FormFieldConfig = { async list() { return []; } };
export const GeneratedChallengeLog = { async list() { return []; } };

// SkillTag Entity
export const SkillTag = {
  async list() {
    return [
      { name: 'Financial Analysis' },
      { name: 'Fraud Detection' },
      { name: 'Data Analytics' },
      { name: 'Expert Testimony' },
      { name: 'Risk Assessment' },
      { name: 'Compliance' },
      { name: 'Litigation Support' },
      { name: 'Asset Tracing' },
      { name: 'Forensic Technology' },
      { name: 'Business Valuation' }
    ];
  }
};

// Demo entities for trial users
export const DemoJobseeker = {
  async list() {
    return [
      {
        id: 'demo-1',
        full_name: 'Demo Candidate 1',
        bio_text: 'Experienced forensic accountant specializing in fraud detection.',
        skills: ['Financial Analysis', 'Fraud Detection', 'Expert Testimony'],
        experience_level: 'mid',
        specialization: 'Fraud Detection'
      },
      {
        id: 'demo-2',
        full_name: 'Demo Candidate 2',
        bio_text: 'Senior forensic professional with litigation support expertise.',
        skills: ['Litigation Support', 'Asset Tracing', 'Risk Assessment'],
        experience_level: 'senior',
        specialization: 'Litigation Support'
      }
    ];
  }
};

// Export API client for direct use
export { apiClient };
export default { User, UserEntity, JobseekerBio, JobPost, Challenge, AIChallengeAnswerKey, JobApplication, SkillTag, DemoJobseeker };