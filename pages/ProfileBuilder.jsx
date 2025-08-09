import React, { useState, useEffect } from 'react';
import { User, UserEntity } from '@/api/entities';
import { JobseekerBio } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, X, Building2, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileBuilder() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    bio_text: '',
    skills: [],
    desired_job_types: [],
    experience_level: '',
    salary_range_min: '',
    salary_range_max: '',
    availability: '',
    work_preference: '',
    certifications: []
  });
  // Company profile state
  const [companyProfile, setCompanyProfile] = useState({
    company_name: '',
    description: '',
    industry: '',
    company_size: '',
    location: '',
    website: '',
    phone: '',
    specializations: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const commonSkills = [
    'Fraud Detection', 'Forensic Accounting', 'Financial Analysis', 'Data Analytics',
    'Compliance', 'Risk Assessment', 'Investigation', 'Anti-Money Laundering',
    'Excel', 'SQL', 'Python', 'Internal Auditing', 'Cybersecurity'
  ];

  const commonSpecializations = [
    'Fraud Investigation',
    'Asset Recovery',
    'Forensic Accounting',
    'Computer Forensics', 
    'Insurance Claims',
    'Matrimonial Disputes',
    'Corporate Investigations',
    'Compliance Auditing',
    'Anti-Money Laundering',
    'Cybersecurity'
  ];

  const jobTypes = [
    'Full-time', 'Part-time', 'Contract', 'Consulting', 'Remote Work', 
    'Project-based', 'Temporary', 'Freelance'
  ];

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      try {
        const currentUser = await User.me();
        if (!isMounted) return;
        setUser(currentUser);

        if (currentUser.role.toLowerCase() === 'company') {
          // Load company profile data from user fields
          setCompanyProfile({
            company_name: currentUser.company_name || '',
            description: currentUser.description || '',
            industry: currentUser.industry || '',
            company_size: currentUser.company_size || '',
            location: currentUser.location || '',
            website: currentUser.website || '',
            phone: currentUser.phone || '',
            specializations: currentUser.specializations || []
          });
        } else {
          // Load jobseeker profile
          const profiles = await JobseekerBio.filter({ user_id: currentUser.id });
          if (!isMounted) return;
          
          if (profiles.length > 0) {
            setProfile(profiles[0]);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (field, value) => {
    if (user?.role.toLowerCase() === 'company') {
      setCompanyProfile(prev => ({ ...prev, [field]: value }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const addSpecialization = (specialization) => {
    if (specialization && !companyProfile.specializations.includes(specialization)) {
      setCompanyProfile(prev => ({ 
        ...prev, 
        specializations: [...prev.specializations, specialization] 
      }));
    }
    setNewSpecialization('');
  };

  const removeSpecialization = (specToRemove) => {
    setCompanyProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter(spec => spec !== specToRemove)
    }));
  };

  const addSkill = (skill) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({ 
        ...prev, 
        skills: [...prev.skills, skill] 
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const toggleJobType = (jobType) => {
    setProfile(prev => ({
      ...prev,
      desired_job_types: prev.desired_job_types.includes(jobType)
        ? prev.desired_job_types.filter(type => type !== jobType)
        : [...prev.desired_job_types, jobType]
    }));
  };

  const addCertification = () => {
    if (newCertification && !profile.certifications.includes(newCertification)) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role.toLowerCase() === 'company') {
        // Save company profile to user fields
        await UserEntity.updateMyUserData(companyProfile);
        window.location.href = createPageUrl("CompanyDashboard");
      } else {
        // Save jobseeker profile
        const profileData = {
          ...profile,
          user_id: user.id,
          salary_range_min: profile.salary_range_min ? parseInt(profile.salary_range_min) : null,
          salary_range_max: profile.salary_range_max ? parseInt(profile.salary_range_max) : null
        };

        const existingProfiles = await JobseekerBio.filter({ user_id: user.id });
        
        if (existingProfiles.length > 0) {
          await JobseekerBio.update(existingProfiles[0].id, profileData);
        } else {
          await JobseekerBio.create(profileData);
        }

        window.location.href = createPageUrl("JobseekerDashboard");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isCompany = user?.role.toLowerCase() === 'company';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link to={createPageUrl(isCompany ? "CompanyDashboard" : "JobseekerDashboard")}>
            <Button variant="ghost" size="sm" className="mb-4 text-slate-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            {isCompany ? <Building2 /> : <UserIcon />}
            {isCompany ? 'Company Profile' : 'Professional Profile'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isCompany 
              ? 'Complete your company information to attract top talent'
              : 'Build your professional profile to stand out to employers'
            }
          </p>
        </header>

        <div className="space-y-8">
          {isCompany ? (
            <>
              {/* Company Profile Form */}
              {/* Company Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={companyProfile.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={companyProfile.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial_services">Financial Services</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="legal">Legal Services</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_size">Company Size</Label>
                      <Select value={companyProfile.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={companyProfile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={companyProfile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={companyProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={companyProfile.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your company, mission, and what makes it unique..."
                      className="h-32"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle>Areas of Specialization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Quick Add Common Specializations</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonSpecializations.map((spec) => (
                        <Button
                          key={spec}
                          variant="outline"
                          size="sm"
                          onClick={() => addSpecialization(spec)}
                          disabled={companyProfile.specializations.includes(spec)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {spec}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Add Custom Specialization</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Enter a specialization..."
                      />
                      <Button onClick={() => addSpecialization(newSpecialization)}>Add</Button>
                    </div>
                  </div>

                  {companyProfile.specializations.length > 0 && (
                    <div>
                      <Label>Your Specializations</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {companyProfile.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {spec}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-500" 
                              onClick={() => removeSpecialization(spec)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleSave} 
                  disabled={saving || !companyProfile.company_name || !companyProfile.description}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Company Profile
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Jobseeker Profile Form */}
              {/* Professional Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="bio_text">About You *</Label>
                    <Textarea
                      id="bio_text"
                      value={profile.bio_text}
                      onChange={(e) => handleInputChange('bio_text', e.target.value)}
                      placeholder="I am a forensic accountant with 5+ years of experience in fraud detection and financial investigations..."
                      className="h-32"
                    />
                  </div>
                </CardContent>
              </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Quick Add Common Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonSkills.map((skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      onClick={() => addSkill(skill)}
                      disabled={profile.skills.includes(skill)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Add Custom Skill</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter a skill..."
                  />
                  <Button onClick={() => addSkill(newSkill)}>Add</Button>
                </div>
              </div>

              {profile.skills.length > 0 && (
                <div>
                  <Label>Your Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Experience & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Experience Level</Label>
                  <Select value={profile.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="junior">Junior (2-5 years)</SelectItem>
                      <SelectItem value="mid">Mid-Level (5-8 years)</SelectItem>
                      <SelectItem value="senior">Senior (8-15 years)</SelectItem>
                      <SelectItem value="expert">Expert (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Work Preference</Label>
                  <Select value={profile.work_preference} onValueChange={(value) => handleInputChange('work_preference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Availability</Label>
                <Select value={profile.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When can you start?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2weeks">2 weeks</SelectItem>
                    <SelectItem value="1month">1 month</SelectItem>
                    <SelectItem value="3months">3 months</SelectItem>
                    <SelectItem value="not_looking">Not actively looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Types */}
          <Card>
            <CardHeader>
              <CardTitle>Desired Job Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {jobTypes.map((jobType) => (
                  <div key={jobType} className="flex items-center space-x-2">
                    <Checkbox
                      id={jobType}
                      checked={profile.desired_job_types.includes(jobType)}
                      onCheckedChange={() => toggleJobType(jobType)}
                    />
                    <Label htmlFor={jobType} className="text-sm">{jobType}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Salary Expectations */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Expectations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Salary ($)</Label>
                  <Input
                    type="number"
                    value={profile.salary_range_min}
                    onChange={(e) => handleInputChange('salary_range_min', e.target.value)}
                    placeholder="60000"
                  />
                </div>
                <div>
                  <Label>Maximum Salary ($)</Label>
                  <Input
                    type="number"
                    value={profile.salary_range_max}
                    onChange={(e) => handleInputChange('salary_range_max', e.target.value)}
                    placeholder="90000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Add Certification</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., CPA, CFE, CISA..."
                  />
                  <Button onClick={addCertification}>Add</Button>
                </div>
              </div>

              {profile.certifications.length > 0 && (
                <div>
                  <Label>Your Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {cert}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeCertification(cert)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={saving || !profile.bio_text || profile.skills.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}