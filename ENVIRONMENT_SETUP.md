# Environment Variables Configuration

This document outlines all required and optional environment variables for the ProofJobs application.

## Required Environment Variables

### Database
```bash
DATABASE_URL="file:./dev.db"
```

### Authentication
```bash
JWT_SECRET="your-super-secure-jwt-secret-key-here"
```

## Optional Environment Variables

### OpenAI Integration (for AI Challenge Features)
```bash
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
```
**Note:** If not provided, AI challenge features will be disabled but the app will continue to work.

### Port Configuration
```bash
PORT=8080
```
**Default:** 8080 (deployment standard), falls back to 5000, then 3001

### Node Environment
```bash
NODE_ENV="production"
```

### Payment Integration (Stripe)
```bash
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

## Deployment Platform Configuration

### For your deployment platform, set these environment variables:

1. **JWT_SECRET** (Required)
   - Generate a secure random string
   - Example: `openssl rand -base64 32`

2. **OPENAI_API_KEY** (Optional but recommended)
   - Get from: https://platform.openai.com/api-keys
   - Format: `sk-proj-...`

3. **PORT** (Usually auto-set by platform)
   - Most platforms automatically set this to 8080
   - Our app will use the platform's PORT or default to 8080

## Example .env file for local development:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secure-jwt-secret-for-local-development"
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
PORT=5000
NODE_ENV="development"
```

## Security Notes

- Never commit the `.env` file to version control
- Use different JWT secrets for development and production
- Rotate secrets regularly
- Use environment-specific OpenAI API keys if needed
