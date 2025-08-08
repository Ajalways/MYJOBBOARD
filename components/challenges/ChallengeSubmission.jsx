import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import apiClient from '../../api/client.js';

export default function ChallengeSubmission({ 
  jobId, 
  applicationId, 
  onSubmissionComplete 
}) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    fetchChallenges();
  }, [jobId]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request(`/challenges/${jobId}`);
      setChallenges(response);

      // Initialize submissions for each challenge
      const initialSubmissions = {};
      response.forEach(challenge => {
        initialSubmissions[challenge.id] = '';
      });
      setSubmissions(initialSubmissions);

    } catch (err) {
      setError('Failed to load challenges');
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionChange = (challengeId, value) => {
    setSubmissions(prev => ({
      ...prev,
      [challengeId]: value
    }));
  };

  const handleSubmit = async (challengeId) => {
    const submission = submissions[challengeId];
    
    if (!submission.trim()) {
      setError('Please provide your solution before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.request('/challenges/submit', {
        method: 'POST',
        body: JSON.stringify({
          challenge_id: challengeId,
          application_id: applicationId,
          submission: submission
        })
      });

      // Store the result
      setResults(prev => ({
        ...prev,
        [challengeId]: response
      }));

      // Clear the submission
      setSubmissions(prev => ({
        ...prev,
        [challengeId]: ''
      }));

      if (onSubmissionComplete) {
        onSubmissionComplete(response);
      }

    } catch (err) {
      setError(err.message || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'SIMPLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLEX': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="w-5 h-5 animate-spin" />
            <span>Loading challenges...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No challenges have been created for this position yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Assessment Challenges</h3>
        <Badge variant="outline">{challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {challenges.map((challenge, index) => {
        const result = results[challenge.id];
        const isSubmitted = !!result;

        return (
          <Card key={challenge.id} className={isSubmitted ? 'border-green-200' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span>Challenge {index + 1}</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline">{challenge.topic.replace('_', ' ')}</Badge>
                </div>
                {isSubmitted && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">Submitted</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Challenge Description</Label>
                <div className="mt-2 p-4 bg-slate-50 border rounded-lg">
                  <p className="whitespace-pre-wrap">{challenge.prompt}</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">Submission Completed</span>
                      {result.score !== null && (
                        <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {result.score}/100
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-green-700 space-y-2">
                      <p><strong>Submitted:</strong> {new Date(result.submitted_at).toLocaleString()}</p>
                      {result.feedback && (
                        <div>
                          <strong>Feedback:</strong>
                          <p className="mt-1 p-2 bg-white rounded border text-gray-700">
                            {result.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`submission-${challenge.id}`}>Your Solution</Label>
                    <Textarea
                      id={`submission-${challenge.id}`}
                      value={submissions[challenge.id] || ''}
                      onChange={(e) => handleSubmissionChange(challenge.id, e.target.value)}
                      placeholder="Provide your detailed analysis and solution here. Include your methodology, findings, and recommendations."
                      rows={8}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Be thorough in your response. Your submission will be automatically evaluated using AI.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>No time limit • AI-powered scoring</span>
                    </div>
                    <Button 
                      onClick={() => handleSubmit(challenge.id)}
                      disabled={submitting || !submissions[challenge.id]?.trim()}
                    >
                      {submitting ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Solution
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">AI-Powered Assessment</p>
            <p>
              Your submissions will be automatically scored using advanced AI that evaluates your 
              forensic accounting knowledge, methodology, and professional presentation. 
              You'll receive detailed feedback and a numerical score for each challenge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
