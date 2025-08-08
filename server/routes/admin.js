import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all form fields
router.get('/form-fields', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { form_type } = req.query;
    
    const where = form_type ? { form_type } : {};
    
    const fields = await req.prisma.formField.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json(fields);
  } catch (error) {
    console.error('Get form fields error:', error);
    res.status(500).json({ error: 'Failed to get form fields' });
  }
});

// Create form field
router.post('/form-fields', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const field = await req.prisma.formField.create({
      data: req.body
    });

    res.status(201).json(field);
  } catch (error) {
    console.error('Create form field error:', error);
    res.status(500).json({ error: 'Failed to create form field' });
  }
});

// Update form field
router.put('/form-fields/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;

    const field = await req.prisma.formField.update({
      where: { id: req.params.id },
      data: updates
    });

    res.json(field);
  } catch (error) {
    console.error('Update form field error:', error);
    res.status(500).json({ error: 'Failed to update form field' });
  }
});

// Delete form field
router.delete('/form-fields/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await req.prisma.formField.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Form field deleted successfully' });
  } catch (error) {
    console.error('Delete form field error:', error);
    res.status(500).json({ error: 'Failed to delete form field' });
  }
});

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      jobseekers,
      companies
    ] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.jobPost.count(),
      req.prisma.jobApplication.count(),
      req.prisma.jobPost.count({ where: { status: 'active' } }),
      req.prisma.jobApplication.count({ where: { status: 'pending' } }),
      req.prisma.user.count({ where: { role: 'JOBSEEKER' } }),
      req.prisma.user.count({ where: { role: 'COMPANY' } })
    ]);

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      jobseekers,
      companies
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

// Get all users with details
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await req.prisma.user.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        phone_verified: true,
        role: true,
        subscription_tier: true,
        vetting_status: true,
        company_name: true,
        company_size: true,
        industry: true,
        created_at: true,
        _count: {
          select: {
            job_posts: true,
            applications: true
          }
        }
      }
    });

    const total = await req.prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user (admin)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;
    delete updates.password; // Don't allow password updates through this endpoint

    const user = await req.prisma.user.update({
      where: { id: req.params.id },
      data: updates,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        phone_verified: true,
        role: true,
        subscription_tier: true,
        vetting_status: true,
        company_name: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await req.prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Initialize default form fields
router.post('/init-form-fields', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if fields already exist
    const existingFields = await req.prisma.formField.count();
    
    if (existingFields > 0) {
      return res.json({ message: 'Form fields already initialized' });
    }

    // Default jobseeker fields
    const jobseekerFields = [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true, visible: true, order: 1, form_type: 'jobseeker', options: [] },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: false, visible: true, order: 2, form_type: 'jobseeker', options: [] },
      { name: 'experience_level', label: 'Experience Level', type: 'select', required: true, visible: true, order: 3, form_type: 'jobseeker', options: ['Entry', 'Mid', 'Senior', 'Executive'] },
      { name: 'specialization', label: 'Specialization Area', type: 'select', required: false, visible: true, order: 4, form_type: 'jobseeker', options: ['Fraud Detection', 'Financial Investigation', 'Litigation Support', 'Compliance', 'Risk Assessment'] },
      { name: 'certifications', label: 'Professional Certifications', type: 'textarea', required: false, visible: true, order: 5, form_type: 'jobseeker', options: [] },
      { name: 'salary_expectation', label: 'Salary Expectation', type: 'number', required: false, visible: true, order: 6, form_type: 'jobseeker', options: [] },
      { name: 'availability', label: 'Availability', type: 'select', required: false, visible: true, order: 7, form_type: 'jobseeker', options: ['Immediate', 'Within 2 weeks', 'Within 1 month', 'Within 3 months'] }
    ];

    // Default company fields
    const companyFields = [
      { name: 'company_name', label: 'Company Name', type: 'text', required: true, visible: true, order: 1, form_type: 'company', options: [] },
      { name: 'company_size', label: 'Company Size', type: 'select', required: true, visible: true, order: 2, form_type: 'company', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
      { name: 'industry', label: 'Industry', type: 'select', required: true, visible: true, order: 3, form_type: 'company', options: ['Accounting Firm', 'Law Firm', 'Insurance', 'Banking', 'Government', 'Corporate', 'Consulting'] },
      { name: 'location', label: 'Company Location', type: 'text', required: false, visible: true, order: 4, form_type: 'company', options: [] },
      { name: 'website', label: 'Company Website', type: 'url', required: false, visible: true, order: 5, form_type: 'company', options: [] },
      { name: 'description', label: 'Company Description', type: 'textarea', required: false, visible: true, order: 6, form_type: 'company', options: [] },
      { name: 'hiring_volume', label: 'Expected Hiring Volume', type: 'select', required: false, visible: true, order: 7, form_type: 'company', options: ['1-5 per year', '6-15 per year', '16-30 per year', '30+ per year'] }
    ];

    await req.prisma.formField.createMany({
      data: [...jobseekerFields, ...companyFields]
    });

    res.json({ message: 'Form fields initialized successfully' });
  } catch (error) {
    console.error('Initialize form fields error:', error);
    res.status(500).json({ error: 'Failed to initialize form fields' });
  }
});

// === CHALLENGE MANAGEMENT ENDPOINTS ===

// Get all challenges with company information
router.get('/challenges', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const challenges = await req.prisma.challenge.findMany({
      include: {
        job_post: {
          include: {
            company: {
              select: {
                company_name: true,
                full_name: true
              }
            }
          }
        },
        created_by_user: {
          select: {
            full_name: true,
            email: true
          }
        },
        _count: {
          select: {
            results: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format the response with company information
    const formattedChallenges = challenges.map(challenge => ({
      ...challenge,
      title: challenge.prompt?.split('\n')[0] || 'Challenge', // Use first line as title
      description: challenge.prompt || 'No description available',
      challenge_type: challenge.type?.toLowerCase() === 'ai' ? 'ai_generated' : 'custom',
      company_name: challenge.job_post?.company?.company_name || challenge.job_post?.company?.full_name || 'Unknown Company',
      job_title: challenge.job_post?.title || 'Unknown Position',
      job_description: challenge.job_post?.description || '',
      attempt_count: challenge._count?.results || 0,
      category: challenge.topic || 'general'
    }));

    res.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error('Get admin challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get all challenge results with user information
router.get('/challenge-results', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const results = await req.prisma.challengeResult.findMany({
      include: {
        candidate: {
          select: {
            full_name: true,
            email: true
          }
        },
        challenge: {
          include: {
            job_post: {
              include: {
                company: {
                  select: {
                    company_name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { submitted_at: 'desc' }
    });

    // Format the response with user information
    const formattedResults = results.map(result => ({
      ...result,
      user_name: result.candidate?.full_name || 'Unknown User',
      user_email: result.candidate?.email || '',
      challenge_title: result.challenge?.prompt?.split('\n')[0] || 'Unknown Challenge',
      company_name: result.challenge?.job_post?.company?.company_name || 'Unknown Company',
      job_title: result.challenge?.job_post?.title || 'Unknown Position',
      submission_text: result.submission || '',
      user_id: result.candidate_id
    }));

    res.json({ results: formattedResults });
  } catch (error) {
    console.error('Get challenge results error:', error);
    res.status(500).json({ error: 'Failed to fetch challenge results' });
  }
});

// Get challenge statistics
router.get('/challenge-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await req.prisma.$transaction(async (prisma) => {
      const totalChallenges = await prisma.challenge.count();
      const aiChallenges = await prisma.challenge.count({
        where: { type: 'AI' }
      });
      const customChallenges = await prisma.challenge.count({
        where: { type: 'CUSTOM' }
      });
      const totalAttempts = await prisma.challengeResult.count();
      const averageScore = await prisma.challengeResult.aggregate({
        _avg: { score: true }
      });
      const flaggedResults = await prisma.challengeResult.count({
        where: {
          OR: [
            { score: { lt: 30 } },
            { feedback: { contains: 'plagiarism' } },
            { feedback: { contains: 'suspicious' } },
            { flagged: true }
          ]
        }
      });

      return {
        totalChallenges,
        aiChallenges,
        customChallenges,
        totalAttempts,
        averageScore: averageScore._avg.score || 0,
        flaggedResults
      };
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get challenge stats error:', error);
    res.status(500).json({ error: 'Failed to fetch challenge statistics' });
  }
});

// Flag/unflag a challenge result
router.patch('/challenge-results/:id/flag', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { flagged, admin_note } = req.body;
    
    const result = await req.prisma.challengeResult.update({
      where: { id: req.params.id },
      data: {
        flagged: flagged,
        admin_note: admin_note,
        reviewed_at: new Date(),
        reviewed_by: req.user.id
      }
    });

    res.json({ message: 'Challenge result updated successfully', result });
  } catch (error) {
    console.error('Flag challenge result error:', error);
    res.status(500).json({ error: 'Failed to update challenge result' });
  }
});

// Delete a challenge (admin only)
router.delete('/challenges/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // First delete all associated challenge results
    await req.prisma.challengeResult.deleteMany({
      where: { challenge_id: req.params.id }
    });

    // Then delete the challenge
    await req.prisma.challenge.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

export default router;
