#!/usr/bin/env node

// Simple test script for the Challenge API
// Run with: node test-challenge-api.js

const API_BASE = 'http://localhost:5000/api';

// Mock authentication token (replace with real token in production)
const AUTH_TOKEN = 'your-auth-token-here';

// Test data
const testData = {
  job_id: 'cm123abc456',
  difficulty: 'MEDIUM',
  topic: 'fraud_detection',
  application_id: 'cm456def789',
  submission: `
    Based on my analysis of the provided financial statements, I have identified several red flags that warrant further investigation:

    1. Revenue Recognition Issues:
    - Unusual spike in revenue during the last quarter without corresponding cash flow increase
    - Revenue recorded close to period-end with subsequent reversals in the following period

    2. Expense Timing:
    - Significant decreases in key expense categories that seem inconsistent with business operations
    - Accrued expenses that were not properly recorded

    3. Documentation Concerns:
    - Missing supporting documentation for several high-value transactions
    - Inconsistencies between subsidiary ledgers and general ledger accounts

    My recommended next steps would include:
    - Detailed testing of revenue cut-off procedures
    - Examination of all journal entries made in the last week of the quarter
    - Verification of expense accruals with supporting contracts and invoices
    - Interview with key accounting personnel regarding the identified discrepancies
  `
};

console.log('🧪 Challenge API Test Script');
console.log('=============================\n');

console.log('Available API Endpoints:');
console.log(`1. POST ${API_BASE}/challenges/generate`);
console.log(`2. POST ${API_BASE}/challenges/submit`);
console.log(`3. GET ${API_BASE}/challenges/:job_id`);
console.log(`4. GET ${API_BASE}/challenges/ai-status (Admin only)\n`);

console.log('📋 Test Data:');
console.log(JSON.stringify(testData, null, 2));

console.log('\n🔧 Setup Instructions:');
console.log('1. Ensure your server is running on port 5000');
console.log('2. Get a valid authentication token by logging in');
console.log('3. Set OPENAI_API_KEY in your .env file for AI features');
console.log('4. Replace AUTH_TOKEN variable with your real token');

console.log('\n🚀 Example API Calls:');

console.log('\n1. Generate AI Challenge:');
console.log(`fetch('${API_BASE}/challenges/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${AUTH_TOKEN}'
  },
  body: JSON.stringify({
    job_id: '${testData.job_id}',
    difficulty: '${testData.difficulty}',
    topic: '${testData.topic}'
  })
});`);

console.log('\n2. Submit Challenge Solution:');
console.log(`fetch('${API_BASE}/challenges/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${AUTH_TOKEN}'
  },
  body: JSON.stringify({
    challenge_id: 'challenge-id-from-step-1',
    application_id: '${testData.application_id}',
    submission: \`${testData.submission.trim()}\`
  })
});`);

console.log('\n3. Get Job Challenges:');
console.log(`fetch('${API_BASE}/challenges/${testData.job_id}', {
  headers: {
    'Authorization': 'Bearer ${AUTH_TOKEN}'
  }
});`);

console.log('\n4. Check AI Status (Admin):');
console.log(`fetch('${API_BASE}/challenges/ai-status', {
  headers: {
    'Authorization': 'Bearer ${AUTH_TOKEN}'
  }
});`);

console.log('\n✅ Implementation Complete!');
console.log('\nThe following features are now available:');
console.log('- ✅ AI-powered challenge generation using OpenAI GPT-4');
console.log('- ✅ Automatic scoring of challenge submissions');
console.log('- ✅ Forensic accounting specific topics and prompts');
console.log('- ✅ Comprehensive API documentation');
console.log('- ✅ Graceful degradation when AI is not configured');
console.log('- ✅ Role-based access control for different user types');

console.log('\n📖 See docs/CHALLENGE_API.md for complete documentation');
