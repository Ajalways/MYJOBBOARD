import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all challenges for a job (for companies)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify the user owns this job or is admin
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { created_by_user: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const challenges = await prisma.challenge.findMany({
      where: { job_id: jobId },
      include: {
        created_by_user: { select: { full_name: true, email: true } },
        results: {
          include: {
            candidate: { select: { full_name: true, email: true } },
            application: { select: { id: true, status: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Create a new challenge
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      job_id,
      type,
      difficulty,
      topic,
      prompt,
      answer_key,
      scoring_rubric
    } = req.body;

    // Verify the user owns this job or is admin
    const job = await prisma.jobPost.findUnique({
      where: { id: job_id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate required fields
    if (!job_id || !type || !difficulty || !topic || !prompt || !answer_key) {
      return res.status(400).json({ 
        error: 'Missing required fields: job_id, type, difficulty, topic, prompt, answer_key' 
      });
    }

    // Validate enum values
    if (!['AI', 'CUSTOM'].includes(type)) {
      return res.status(400).json({ error: 'Type must be AI or CUSTOM' });
    }

    if (!['SIMPLE', 'MEDIUM', 'COMPLEX'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be SIMPLE, MEDIUM, or COMPLEX' });
    }

    const challenge = await prisma.challenge.create({
      data: {
        job_id,
        created_by: req.user.id,
        type,
        difficulty,
        topic,
        prompt,
        answer_key,
        scoring_rubric: scoring_rubric || ''
      },
      include: {
        job_post: { select: { title: true } },
        created_by_user: { select: { full_name: true, email: true } }
      }
    });

    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Get challenge results for a specific challenge
router.get('/:challengeId/results', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Verify access to challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { job_post: true }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = await prisma.challengeResult.findMany({
      where: { challenge_id: challengeId },
      include: {
        candidate: { 
          select: { 
            id: true, 
            full_name: true, 
            email: true 
          } 
        },
        application: { 
          select: { 
            id: true, 
            status: true, 
            created_at: true 
          } 
        }
      },
      orderBy: { submitted_at: 'desc' }
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching challenge results:', error);
    res.status(500).json({ error: 'Failed to fetch challenge results' });
  }
});

// Submit challenge result (for candidates)
router.post('/:challengeId/submit', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { application_id, submission } = req.body;

    if (!application_id || !submission) {
      return res.status(400).json({ 
        error: 'Missing required fields: application_id, submission' 
      });
    }

    // Verify the application belongs to the user
    const application = await prisma.jobApplication.findUnique({
      where: { id: application_id },
      include: { job_post: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.jobseeker_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify the challenge exists and belongs to the job
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.job_id !== application.job_post_id) {
      return res.status(400).json({ error: 'Challenge does not belong to this job' });
    }

    // Check if already submitted
    const existingResult = await prisma.challengeResult.findFirst({
      where: {
        challenge_id: challengeId,
        application_id: application_id,
        candidate_id: req.user.id
      }
    });

    if (existingResult) {
      return res.status(400).json({ error: 'Challenge already submitted' });
    }

    const result = await prisma.challengeResult.create({
      data: {
        challenge_id: challengeId,
        application_id,
        candidate_id: req.user.id,
        submission
      },
      include: {
        challenge: { select: { topic: true, difficulty: true } },
        application: { select: { id: true } }
      }
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error submitting challenge result:', error);
    res.status(500).json({ error: 'Failed to submit challenge result' });
  }
});

// Score a challenge result (for companies/admins)
router.put('/results/:resultId/score', authenticateToken, async (req, res) => {
  try {
    const { resultId } = req.params;
    const { score, feedback, flagged } = req.body;

    // Get the challenge result with related data
    const result = await prisma.challengeResult.findUnique({
      where: { id: resultId },
      include: {
        challenge: { 
          include: { 
            job_post: true 
          } 
        }
      }
    });

    if (!result) {
      return res.status(404).json({ error: 'Challenge result not found' });
    }

    // Verify permission to score
    if (result.challenge.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate score
    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    const updatedResult = await prisma.challengeResult.update({
      where: { id: resultId },
      data: {
        ...(score !== undefined && { score }),
        ...(feedback !== undefined && { feedback }),
        ...(flagged !== undefined && { flagged })
      },
      include: {
        candidate: { select: { full_name: true, email: true } },
        challenge: { select: { topic: true, difficulty: true } }
      }
    });

    res.json(updatedResult);
  } catch (error) {
    console.error('Error scoring challenge result:', error);
    res.status(500).json({ error: 'Failed to score challenge result' });
  }
});

// Get challenges for a candidate (their submitted challenges)
router.get('/my-challenges', authenticateToken, async (req, res) => {
  try {
    const results = await prisma.challengeResult.findMany({
      where: { candidate_id: req.user.id },
      include: {
        challenge: {
          include: {
            job_post: { 
              select: { 
                title: true, 
                company_name: true 
              } 
            }
          }
        },
        application: { 
          select: { 
            id: true, 
            status: true 
          } 
        }
      },
      orderBy: { submitted_at: 'desc' }
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// AI Challenge Generation endpoint
router.post('/generate-ai', authenticateToken, async (req, res) => {
  try {
    const { job_id, topic, difficulty, count = 1 } = req.body;

    if (!job_id || !topic || !difficulty) {
      return res.status(400).json({ 
        error: 'Missing required fields: job_id, topic, difficulty' 
      });
    }

    // Verify job ownership
    const job = await prisma.jobPost.findUnique({
      where: { id: job_id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const challenges = [];

    // Forensic accounting challenge templates
    const templates = {
      'fraud_detection': [
        {
          prompt: `You are investigating a potential fraud case. Review the provided financial statements and identify red flags that might indicate fraudulent activity. Consider unusual account fluctuations, timing discrepancies, and documentation gaps. Provide your analysis methodology and conclusions.`,
          answer_key: `Key indicators to look for: 1) Unusual journal entries near period end, 2) Inconsistent documentation, 3) Unexplained account balance changes, 4) Missing supporting documents, 5) Patterns in round numbers. Analysis should include trend analysis, ratio analysis, and detailed review of supporting documentation.`,
          scoring_rubric: `Points awarded for: Identification of red flags (30%), Methodology explanation (25%), Supporting evidence analysis (25%), Professional conclusions (20%)`
        },
        {
          prompt: `A company's cash flow statements show consistent positive operating cash flows, but net income has been declining for three consecutive quarters. Analyze this discrepancy and identify potential causes, including any indicators of earnings manipulation.`,
          answer_key: `Potential causes include: 1) Aggressive revenue recognition, 2) Understated expenses, 3) Working capital manipulation, 4) One-time gains masking operational issues. Investigation should focus on revenue quality, expense timing, and working capital trends.`,
          scoring_rubric: `Evaluation criteria: Cash flow analysis accuracy (35%), Identification of manipulation techniques (30%), Investigation recommendations (35%)`
        }
      ],
      'financial_investigation': [
        {
          prompt: `You are tasked with investigating suspected embezzlement in the accounts payable department. The controller reports unusual vendor payments and duplicate invoices. Outline your investigation approach and key areas of focus.`,
          answer_key: `Investigation steps: 1) Vendor master file analysis, 2) Duplicate payment testing, 3) Authorization review, 4) Segregation of duties assessment, 5) Digital forensics on accounting systems. Focus on payment approvals, vendor verification, and system access logs.`,
          scoring_rubric: `Assessment areas: Investigation methodology (40%), Risk area identification (30%), Evidence collection approach (30%)`
        }
      ],
      'litigation_support': [
        {
          prompt: `In a breach of contract case, you need to calculate economic damages. The plaintiff claims lost profits of $2M over 3 years due to defendant's actions. What factors should you consider in your damages analysis?`,
          answer_key: `Factors to consider: 1) But-for scenario analysis, 2) Mitigation efforts, 3) Market conditions, 4) Causation analysis, 5) Comparative performance metrics. Must establish baseline performance and demonstrate causal relationship between breach and losses.`,
          scoring_rubric: `Scoring based on: Damages methodology (35%), Causation analysis (25%), Supporting calculations (25%), Professional presentation (15%)`
        }
      ]
    };

    const topicTemplates = templates[topic] || templates['fraud_detection'];
    
    for (let i = 0; i < Math.min(count, topicTemplates.length); i++) {
      const template = topicTemplates[i];
      
      challenges.push({
        job_id,
        type: 'AI',
        difficulty,
        topic,
        prompt: template.prompt,
        answer_key: template.answer_key,
        scoring_rubric: template.scoring_rubric,
        created_by: req.user.id
      });
    }

    res.json({ challenges });
  } catch (error) {
    console.error('Error generating AI challenges:', error);
    res.status(500).json({ error: 'Failed to generate AI challenges' });
  }
});

// Delete a challenge (admin/owner only)
router.delete('/:challengeId', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.created_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.challenge.delete({
      where: { id: challengeId }
    });

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

export default router;
