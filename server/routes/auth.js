import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { 
      body: req.body, 
      headers: req.headers['content-type'] 
    });
    
    const { email, password, full_name, role, ...additionalData } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, full_name: !!full_name });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log('👤 Creating user with data:', { email, role, full_name });
    const userData = {
      email,
      password: hashedPassword,
      full_name,
      role: role || 'JOBSEEKER'
    };

    // Add role-specific data
    if (role === 'COMPANY') {
      console.log('🏢 Adding company data...');
      userData.company_name = additionalData.company_name;
      userData.company_size = additionalData.company_size;
      userData.industry = additionalData.industry;
      userData.location = additionalData.location;
      userData.website = additionalData.website;
    }

    console.log('💾 Creating user in database...');
    const user = await req.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        phone_verified: true,
        vetting_status: true,
        company_name: true
      }
    });
    console.log('✅ User created:', user.id);

    // Create jobseeker bio if needed
    if (role === 'JOBSEEKER') {
      console.log('📝 Creating jobseeker bio...');
      await req.prisma.jobseekerBio.create({
        data: { user_id: user.id }
      });
      console.log('✅ Jobseeker bio created');
    }

    // Generate token
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎉 Registration successful for user:', user.email);
    res.status(201).json({
      user,
      token,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        full_name: true,
        role: true,
        phone_verified: true,
        vetting_status: true,
        company_name: true,
        subscription_tier: true
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
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
        location: true,
        website: true,
        description: true,
        created_at: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;
    delete updates.email;
    delete updates.password;

    const user = await req.prisma.user.update({
      where: { id: req.user.id },
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
        company_name: true,
        company_size: true,
        industry: true,
        location: true,
        website: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
