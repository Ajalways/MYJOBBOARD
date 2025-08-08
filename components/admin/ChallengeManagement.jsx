import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, RefreshCw, Eye, BarChart3, Users, Target } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { api } from '../../api/client';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [challengeResults, setChallengeResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [regenerating, setRegenerating] = useState(null);
  const { toast } = useToast();

  // Fetch challenges and results
  useEffect(() => {
    fetchChallenges();
    fetchChallengeResults();
  }, []);

  // Filter challenges based on search and filters
  useEffect(() => {
    let filtered = challenges;

    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'ALL') {
      const filterValue = filterType.toLowerCase();
      filtered = filtered.filter(challenge => 
        challenge.challenge_type === filterValue || 
        (filterValue === 'ai_generated' && challenge.type === 'AI') ||
        (filterValue === 'custom' && challenge.type === 'CUSTOM')
      );
    }

    if (filterDifficulty !== 'ALL') {
      filtered = filtered.filter(challenge => challenge.difficulty === filterDifficulty.toLowerCase());
    }

    setFilteredChallenges(filtered);
  }, [challenges, searchTerm, filterType, filterDifficulty]);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/admin/challenges');
      setChallenges(response.data.challenges || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch challenges",
        variant: "destructive",
      });
    }
  };

  const fetchChallengeResults = async () => {
    try {
      const response = await api.get('/admin/challenge-results');
      setChallengeResults(response.data.results || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch challenge results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChallengeStats = (challengeId) => {
    const results = challengeResults.filter(result => result.challenge_id === challengeId);
    const totalAttempts = results.length;
    const passedAttempts = results.filter(result => result.score >= 70).length;
    const passRate = totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0;
    const avgScore = totalAttempts > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / totalAttempts).toFixed(1) : 0;
    
    return {
      totalAttempts,
      passedAttempts,
      passRate,
      avgScore
    };
  };

  const getFlaggedResults = () => {
    return challengeResults.filter(result => 
      result.score < 30 || // Very low score
      result.feedback?.toLowerCase().includes('plagiarism') ||
      result.feedback?.toLowerCase().includes('suspicious') ||
      result.flagged
    );
  };

  const regenerateChallenge = async (challenge) => {
    setRegenerating(challenge.id);
    try {
      const response = await api.post('/challenges/generate', {
        jobTitle: challenge.job_title || 'Forensic Accountant',
        jobDescription: challenge.job_description || challenge.description,
        difficulty: challenge.difficulty.toUpperCase(),
        topic: challenge.category || 'general'
      });

      // Update the challenge with new content using the correct schema fields
      await api.put(`/challenges/${challenge.id}`, {
        prompt: response.data.title + '\n\n' + response.data.description,
        type: 'AI',
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Challenge regenerated successfully",
      });

      fetchChallenges();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate challenge",
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Challenge Management</h2>
          <p className="text-muted-foreground">Manage and monitor all assessment challenges</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchChallenges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Challenges</p>
                <p className="text-2xl font-bold">{challenges.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Generated</p>
                <p className="text-2xl font-bold">
                  {challenges.filter(c => c.challenge_type === 'ai_generated' || c.type === 'AI').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{challengeResults.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Results</p>
                <p className="text-2xl font-bold text-red-600">{getFlaggedResults().length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="challenges">All Challenges</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Results</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="AI_GENERATED">AI Generated</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Difficulties</SelectItem>
                <SelectItem value="SIMPLE">Simple</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Challenges List */}
          <div className="grid gap-4">
            {filteredChallenges.map((challenge) => {
              const stats = getChallengeStats(challenge.id);
              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={challenge.challenge_type === 'ai_generated' || challenge.type === 'AI' ? 'default' : 'secondary'}>
                            {challenge.challenge_type === 'ai_generated' || challenge.type === 'AI' ? 'AI Generated' : 'Custom'}
                          </Badge>
                          <Badge variant="outline">
                            {challenge.difficulty?.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {challenge.company_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{challenge.title}</DialogTitle>
                              <DialogDescription>
                                Challenge Details and Statistics
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{challenge.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Statistics</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>Total Attempts: {stats.totalAttempts}</p>
                                    <p>Pass Rate: {stats.passRate}%</p>
                                    <p>Average Score: {stats.avgScore}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>Created: {formatDate(challenge.created_at)}</p>
                                    <p>Time Limit: {challenge.time_limit_minutes || 60} minutes</p>
                                    <p>Category: {challenge.category || 'General'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {challenge.challenge_type === 'ai_generated' || challenge.type === 'AI' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={regenerating === challenge.id}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === challenge.id ? 'animate-spin' : ''}`} />
                                Regenerate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Regenerate Challenge</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will create a new AI-generated challenge with the same parameters. 
                                  The existing challenge content will be replaced. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => regenerateChallenge(challenge)}>
                                  Regenerate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {challenge.description}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Attempts</span>
                        <p className="text-muted-foreground">{stats.totalAttempts}</p>
                      </div>
                      <div>
                        <span className="font-medium">Pass Rate</span>
                        <p className={`${parseFloat(stats.passRate) >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.passRate}%
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Avg Score</span>
                        <p className="text-muted-foreground">{stats.avgScore}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created</span>
                        <p className="text-muted-foreground">{formatDate(challenge.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredChallenges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No challenges found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Flagged Challenge Results</h3>
            
            {getFlaggedResults().map((result) => {
              const challenge = challenges.find(c => c.id === result.challenge_id);
              return (
                <Card key={result.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          {challenge?.title || 'Unknown Challenge'}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Score: {result.score}</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {result.user_name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(result.submitted_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-1">Submission</h4>
                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded line-clamp-3">
                          {result.submission_text}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">AI Feedback</h4>
                        <p className="text-sm text-muted-foreground bg-red-50 p-2 rounded">
                          {result.feedback}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Flagged for: Low score ({result.score < 30 ? 'Very low score' : 'Review required'})
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {getFlaggedResults().length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No flagged results found</p>
                  <p className="text-sm text-muted-foreground">All challenge submissions appear normal</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeManagement;
