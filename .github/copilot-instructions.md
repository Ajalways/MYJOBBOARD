# ProofJobs Platform - AI Coding Instructions

## Architecture Overview

This is a **full-stack job platform** for forensic accounting professionals with a **dual-server development architecture**:

- **Frontend**: React 18 + Vite (port 3000) with shadcn/ui components
- **Backend**: Express.js API server (port 3001) with SQLite + Prisma ORM  
- **Production**: Single Express server serving both static files and API

## Development Workflow

**Start development**: `npm run dev` (runs both servers concurrently)
- Frontend: `http://localhost:3000` (Vite dev server)
- Backend API: `http://localhost:3001/api` (Express server)

**Database operations**:
- `npm run db:migrate` - Apply schema changes  
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed with test data

**Deployment**: Auto-deploys via DigitalOcean App Platform on pushes to `main` branch

## Key Architectural Patterns

### API Client Pattern
All API calls use the centralized `api/client.js` with JWT token management:
```javascript
// Environment-aware API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### Role-Based UI Rendering
Three distinct user roles with separate dashboards:
- `JOBSEEKER` → `JobseekerDashboard.jsx`
- `COMPANY` → `CompanyDashboard.jsx` 
- `ADMIN` → `AdminDashboard.jsx`

### Environment-Specific Configuration
- **Development**: CSP disabled, detailed error logging, localhost APIs
- **Production**: CSP enabled, relative API URLs, minimal logging

## Critical Development Conventions

### Server Route Structure
Routes in `server/routes/` follow this pattern:
```javascript
// All routes get Prisma client via middleware
router.post('/endpoint', async (req, res) => {
  const data = await req.prisma.model.create({ /* */ });
});
```

### Frontend Page Routing
Pages use utility-based navigation:
```javascript
import { createPageUrl } from "../utils";
window.location.href = createPageUrl("CompanyDashboard");
```

### Component Organization
- `components/ui/` - Base shadcn/ui components (don't modify)
- `components/admin/` - Admin-specific business logic
- `components/challenges/` - AI challenge system
- `components/company/` - Company subscription logic

## Database Schema Patterns

### User Model Design
Single `User` table with role-specific optional fields:
```prisma
model User {
  role String @default("JOBSEEKER") // ADMIN, COMPANY, JOBSEEKER
  // Company fields (nullable)
  company_name String?
  company_size String?
  // Relations
  jobseeker_bio JobseekerBio?
  company_subscription CompanySubscription?
}
```

### Challenge System
AI-generated skill assessments with responses:
- `Challenge` - Question definitions
- `ChallengeResponse` - User submissions with scoring

## Integration Points

### Payment Processing
Stripe integration for company subscriptions in `server/routes/payments.js`

### AI Challenge Generation  
OpenAI integration for dynamic challenge creation (optional feature)

### Authentication Flow
JWT-based with role-specific redirects after login/registration

## Debugging Workflows

**API Errors**: Check both browser console AND terminal server logs
**Database Issues**: Use `npx prisma studio` to inspect data
**Build Problems**: Ensure paths use relative URLs for production deployment
**CORS/CSP Issues**: Development disables CSP, production enables it

## Deployment Notes

**Production differences**:
- API URLs become relative (`/api` instead of `localhost:3001`)
- Database migrations run via `npx prisma migrate deploy`
- Static files served from Express, not Vite
- All environment variables set in `app.yaml`
