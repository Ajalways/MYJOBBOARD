# Proof Jobs Platform

A modern job platform connecting forensic accounting professionals with specialized opportunities.

## Features

- **User Management**: Role-based access for jobseekers, companies, and administrators
- **Job Posting & Applications**: Complete job lifecycle management
- **Stripe Payment Integration**: Secure payment processing for premium features
- **AI Challenge Generator**: Custom skill assessments for job positions
- **Real-time Dashboards**: Comprehensive analytics and management tools
- **Mobile Responsive**: Optimized for all devices

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based authentication
- **Payments**: Stripe integration
- **Deployment**: DigitalOcean App Platform
- **AI-Powered**: Automated challenge generation for candidate assessment

## Project Structure

```
src/
├── api/                    # Base44 SDK integration
├── components/            # Reusable UI components
│   ├── admin/            # Admin dashboard components
│   ├── challenges/       # Challenge management
│   ├── company/          # Company-specific components
│   └── ui/               # Base UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── pages/                # Application pages/routes
├── utils/                # Helper functions
└── App.jsx               # Main application component
```

## Local Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone or download your project**
```bash
cd "c:\\Users\\umidn\\Desktop\\the proof app"
```

2. **Create package.json in the root directory** (copy from src/package.json template)

3. **Install dependencies**
```bash
npm install
```

4. **Set up environment variables**
```bash
cp src/.env.example .env
```

5. **Move configuration files to root**
```bash
move src\\vite.config.js .
move src\\tailwind.config.js .
move src\\postcss.config.js .
move src\\index.html .
```

6. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Digital Ocean App Platform (Recommended)

1. **Push code to GitHub**
   - Create a new GitHub repository
   - Push your code to the repository

2. **Deploy to Digital Ocean**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Use the provided `app.yaml` configuration
   - Set environment variables:
     - `VITE_BASE44_APP_ID`: Your Base44 app ID
     - `VITE_API_URL`: https://api.base44.com

3. **Domain Setup**
   - Add your custom domain in the App Platform settings
   - Update DNS records to point to DigitalOcean

### Option 2: Docker Deployment

1. **Build the Docker image**
```bash
docker build -t proofjobs .
```

2. **Run the container**
```bash
docker run -p 80:80 proofjobs
```

3. **Deploy to any cloud provider** (AWS, Google Cloud, Azure, etc.)

### Option 3: Static Site Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy the `dist` folder to**:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static hosting service

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE44_APP_ID` | Your Base44 application ID | Yes |
| `VITE_API_URL` | Base44 API URL | Yes |
| `VITE_APP_NAME` | Application name | No |

## Base44 Configuration

Your app uses Base44 for backend services:
- Authentication
- Database entities
- Payment processing
- AI integrations

Make sure your Base44 app is properly configured with:
- Stripe payment integration
- Authentication providers
- Database schema matching your entities

## File Structure for Deployment

```
project-root/
├── src/                   # Source code (your current workspace)
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── index.html            # HTML template
├── Dockerfile            # Docker configuration
├── nginx.conf            # Nginx configuration
├── app.yaml              # Digital Ocean App Platform config
└── .env                  # Environment variables
```

## Database Entities

Your app uses these Base44 entities:
- `User` - Authentication and user management
- `JobPost` - Job listings
- `JobApplication` - Job applications
- `JobseekerBio` - Jobseeker profiles
- `Challenge` - Assessment challenges
- `ChallengeResponse` - Challenge submissions
- `CompanySubscription` - Company billing
- `SkillTag` - Skill management

## Troubleshooting

### Common Issues

1. **Build fails with module resolution errors**
   - Ensure all files are moved to the correct locations
   - Check that the `@` alias is working in vite.config.js

2. **Base44 authentication not working**
   - Verify your `VITE_BASE44_APP_ID` is correct
   - Check that your Base44 app has authentication enabled

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check that index.css includes Tailwind directives

4. **Routing issues in production**
   - Make sure your hosting service supports client-side routing
   - Check nginx.conf for proper fallback routing

## Next Steps

1. **Move configuration files** from `src/` to project root
2. **Create package.json** in project root
3. **Install dependencies** and test locally
4. **Push to GitHub** repository
5. **Deploy to Digital Ocean** App Platform
6. **Set up custom domain** (optional)

## Support

For issues with:
- **Base44 backend**: Check Base44 documentation
- **UI components**: Check shadcn/ui documentation
- **Deployment**: Follow the deployment guides above

## License

Private project - All rights reserved
