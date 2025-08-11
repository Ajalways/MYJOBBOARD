import React, { useState, useEffect } from 'react';
import { User, JobPost, SkillTag } from '@/api/entities';
import { useLocation, useNavigate } from 'react-router-dom';
import StatCard from '../components/admin/StatCard';
import UserManagement from '../components/admin/UserManagement';
import JobManagement from '../components/admin/JobManagement';
import SkillManagement from '../components/admin/SkillManagement';
import FormFieldManager from '../components/admin/FormFieldManager';
import AIChallengeManager from '../components/admin/AIChallengeManager';
import AIConfiguration from '../components/admin/AIConfiguration';
import ChallengeManagement from '../components/admin/ChallengeManagement';
import { Users, Briefcase, UserCheck, BarChart2, Settings, Sparkles, Brain, Zap, Shield, DollarSign, FileText, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User as UserEntity } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    companies: 0, 
    jobseekers: 0, 
    activeJobs: 0,
    totalRevenue: 0,
    activeChallenges: 0,
    aiEnabled: false,
    stripeEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const currentUser = await UserEntity.me();
        if (!isMounted) return;

        if (currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }

        setLoading(true);
        const usersPromise = User.list();
        const jobsPromise = JobPost.list();
        const configPromise = fetch('/api/admin/config').then(r => r.ok ? r.json() : {});
        
        const [users, jobs, config] = await Promise.all([usersPromise, jobsPromise, configPromise]);

        if (isMounted) {
          setStats({
            totalUsers: users.length,
            companies: users.filter(u => u.role === 'company').length,
            jobseekers: users.filter(u => u.role === 'jobseeker').length,
            activeJobs: jobs.filter(j => j.status === 'active').length,
            totalRevenue: 0, // TODO: Calculate from payments
            activeChallenges: 0, // TODO: Get from challenges API
            aiEnabled: config.ai?.enabled || false,
            stripeEnabled: config.stripe?.enabled || false
          });

          // Set quick actions based on configuration
          const actions = [];
          if (!config.ai?.enabled) {
            actions.push({ type: 'ai-setup', message: 'AI is not configured. Set up AI to enable challenge generation.' });
          }
          if (!config.stripe?.enabled) {
            actions.push({ type: 'stripe-setup', message: 'Stripe is not configured. Set up payments to enable premium features.' });
          }
          setQuickActions(actions);
        }
      } catch (e) {
        if (isMounted) {
          console.error("Failed to load admin data", e);
          // Check for authentication errors
          if (e.message === 'User not found' || 
              e.message.includes('Authentication failed') || 
              e.message.includes('unauthorized') || 
              e.message.includes('invalid token')) {
            // Clear invalid token and redirect to login
            localStorage.removeItem('auth_token');
            window.location.href = createPageUrl("Auth");
            return;
          }
          if (e.message.includes('Unauthorized')) {
            navigate(createPageUrl('Home'));
          }
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleTabChange = (value) => {
    navigate(`${location.pathname}?tab=${value}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Platform overview and management tools.</p>
        </header>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="overview">
              <BarChart2 className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="config">
              <Brain className="w-4 h-4 mr-1" />
              AI & Payments
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="w-4 h-4 mr-1" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Shield className="w-4 h-4 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="forms">
              <Settings className="w-4 h-4 mr-1" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="ai-gen">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Activity className="w-4 h-4 mr-1" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Quick Actions Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <Alert key={index}>
                          <AlertDescription className="flex items-center justify-between">
                            <span>{action.message}</span>
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-emerald-50"
                              onClick={() => handleTabChange('config')}
                            >
                              Configure Now
                            </Badge>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Users" 
                  value={stats.totalUsers} 
                  icon={Users} 
                  loading={loading}
                  subtitle="Platform members"
                />
                <StatCard 
                  title="Companies" 
                  value={stats.companies} 
                  icon={Briefcase} 
                  loading={loading}
                  subtitle="Hiring organizations"
                />
                <StatCard 
                  title="Job Seekers" 
                  value={stats.jobseekers} 
                  icon={UserCheck} 
                  loading={loading}
                  subtitle="Candidates available"
                />
                <StatCard 
                  title="Active Jobs" 
                  value={stats.activeJobs} 
                  icon={BarChart2} 
                  loading={loading}
                  subtitle="Currently posted"
                />
              </div>

              {/* Service Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="AI Service" 
                  value={stats.aiEnabled ? "Enabled" : "Disabled"} 
                  icon={Brain} 
                  loading={loading}
                  subtitle="Challenge generation"
                  status={stats.aiEnabled ? "success" : "warning"}
                />
                <StatCard 
                  title="Stripe Payments" 
                  value={stats.stripeEnabled ? "Connected" : "Not Connected"} 
                  icon={Zap} 
                  loading={loading}
                  subtitle="Payment processing"
                  status={stats.stripeEnabled ? "success" : "warning"}
                />
                <StatCard 
                  title="Total Revenue" 
                  value={`$${stats.totalRevenue.toLocaleString()}`} 
                  icon={DollarSign} 
                  loading={loading}
                  subtitle="All-time earnings"
                />
                <StatCard 
                  title="AI Challenges" 
                  value={stats.activeChallenges} 
                  icon={Sparkles} 
                  loading={loading}
                  subtitle="Generated this month"
                />
              </div>

              {/* User Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Admin Panel Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">🤖 AI Configuration</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Set up OpenAI, Claude, or Azure AI to enable companies to generate forensic accounting challenges automatically.
                      </p>
                      
                      <h4 className="font-semibold mb-2">💳 Stripe Setup</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Connect Stripe to enable premium subscriptions and challenge purchases.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">👥 User Management</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Manage users, approve companies, and handle verification processes.
                      </p>
                      
                      <h4 className="font-semibold mb-2">🎯 Challenge Generation</h4>
                      <p className="text-sm text-slate-600">
                        Create AI-powered challenges for fraud detection, financial investigation, and litigation support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <AIConfiguration />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="jobs">
            <JobManagement />
          </TabsContent>
          <TabsContent value="skills">
            <SkillManagement />
          </TabsContent>
          <TabsContent value="forms">
            <FormFieldManager />
          </TabsContent>
          <TabsContent value="ai-gen">
            <AIChallengeManager />
          </TabsContent>
          <TabsContent value="challenges">
            <ChallengeManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}