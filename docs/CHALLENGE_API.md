# Challenge API with OpenAI Integration

## Overview
These API endpoints provide AI-powered challenge generation and scoring for forensic accounting positions using OpenAI's GPT-4.

## Prerequisites
- OpenAI API key set in environment variable: `OPENAI_API_KEY`
- Valid authentication token in request headers

## API Endpoints

### 1. Generate AI Challenge
**POST** `/api/challenges/generate`

Generates a forensic accounting challenge using OpenAI GPT-4.

**Request Body:**
```json
{
  "job_id": "cm123abc456",
  "difficulty": "MEDIUM",
  "topic": "fraud_detection"
}
```

**Parameters:**
- `job_id` (string): ID of the job posting
- `difficulty` (string): "SIMPLE", "MEDIUM", or "COMPLEX"
- `topic` (string): Challenge topic (e.g., "fraud_detection", "financial_investigation", "litigation_support")

**Response:**
```json
{
  "challenge_id": "cm789xyz123",
  "prompt": "You are investigating a potential fraud case...",
  "difficulty": "MEDIUM",
  "topic": "fraud_detection",
  "created_at": "2025-08-08T12:00:00Z"
}
```

### 2. Submit and Score Challenge
**POST** `/api/challenges/submit`

Submits a candidate's solution and automatically scores it using AI.

**Request Body:**
```json
{
  "challenge_id": "cm789xyz123",
  "application_id": "cm456def789",
  "submission": "Based on my analysis of the financial statements, I identified the following red flags..."
}
```

**Parameters:**
- `challenge_id` (string): ID of the challenge
- `application_id` (string): ID of the job application
- `submission` (string): Candidate's written response

**Response:**
```json
{
  "result_id": "cm321ghi456",
  "score": 87,
  "feedback": "Excellent analysis showing strong understanding of fraud indicators. The candidate correctly identified...",
  "submitted_at": "2025-08-08T12:30:00Z"
}
```

### 3. Get Job Challenges
**GET** `/api/challenges/:job_id`

Retrieves all challenges associated with a specific job.

**URL Parameters:**
- `job_id` (string): ID of the job posting

**Response for Job Owners/Admins:**
```json
[
  {
    "id": "cm789xyz123",
    "type": "AI",
    "difficulty": "MEDIUM",
    "topic": "fraud_detection",
    "prompt": "You are investigating a potential fraud case...",
    "answer_key": "Key indicators to look for: 1) Unusual journal entries...",
    "scoring_rubric": "Points awarded for: Identification of red flags (30%)...",
    "created_at": "2025-08-08T12:00:00Z",
    "results": [
      {
        "candidate": {"full_name": "John Doe", "email": "john@example.com"},
        "application": {"id": "cm456def789", "status": "under_review"}
      }
    ]
  }
]
```

**Response for Candidates:**
```json
[
  {
    "id": "cm789xyz123",
    "type": "AI",
    "difficulty": "MEDIUM",
    "topic": "fraud_detection",
    "prompt": "You are investigating a potential fraud case...",
    "created_at": "2025-08-08T12:00:00Z"
  }
]
```

## Available Topics

- `fraud_detection` - Fraud detection and prevention
- `financial_investigation` - Financial investigation and forensic analysis
- `litigation_support` - Litigation support and expert testimony
- `compliance` - Regulatory compliance and internal controls
- `asset_tracing` - Asset tracing and recovery
- `data_analysis` - Financial data analysis and pattern recognition

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: job_id, difficulty, topic"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Job not found"
}
```

### 503 Service Unavailable
```json
{
  "error": "AI service not configured. Please contact administrator."
}
```

## Example Usage

### 1. Generate a Challenge
```javascript
const response = await fetch('/api/challenges/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    job_id: 'cm123abc456',
    difficulty: 'MEDIUM',
    topic: 'fraud_detection'
  })
});

const challenge = await response.json();
console.log('Generated challenge:', challenge.prompt);
```

### 2. Submit a Solution
```javascript
const response = await fetch('/api/challenges/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    challenge_id: 'cm789xyz123',
    application_id: 'cm456def789',
    submission: 'My analysis reveals several red flags indicating potential fraud...'
  })
});

const result = await response.json();
console.log('Score:', result.score);
console.log('Feedback:', result.feedback);
```

### 3. Get Challenges for a Job
```javascript
const response = await fetch(`/api/challenges/${jobId}`, {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});

const challenges = await response.json();
console.log('Available challenges:', challenges.length);
```

## Admin Endpoint

### Check AI Status
**GET** `/api/challenges/ai-status`

Checks if OpenAI is properly configured (Admin only).

**Response:**
```json
{
  "openai_configured": true,
  "message": "OpenAI is properly configured and ready for challenge generation"
}
```

## Configuration

To enable AI features, set your OpenAI API key in the `.env` file:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

The system will gracefully degrade if OpenAI is not configured:
- Challenge generation will return an error asking to contact admin
- Challenge submissions will be saved without AI scoring
- Manual review will be required for unscored submissions
