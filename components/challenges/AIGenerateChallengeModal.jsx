import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '@/api/client.js';

export default function AIGenerateChallengeModal({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle,
  onChallengeGenerated 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedChallenge, setGeneratedChallenge] = useState(null);
  const [formData, setFormData] = useState({
    difficulty: '',
    topic: '',
    customTopic: ''
  });

  const difficulties = [
    { value: 'SIMPLE', label: 'Simple', description: 'Basic level, suitable for entry-level professionals' },
    { value: 'MEDIUM', label: 'Medium', description: 'Intermediate level, requiring some experience' },
    { value: 'COMPLEX', label: 'Complex', description: 'Advanced level, requiring significant expertise' }
  ];

  const predefinedTopics = [
    { value: 'fraud_detection', label: 'Fraud Detection', description: 'Identifying fraudulent activities and red flags' },
    { value: 'financial_investigation', label: 'Financial Investigation', description: 'Investigating financial discrepancies and irregularities' },
    { value: 'litigation_support', label: 'Litigation Support', description: 'Expert testimony and damage calculations' },
    { value: 'compliance', label: 'Compliance & Controls', description: 'Regulatory compliance and internal controls' },
    { value: 'asset_tracing', label: 'Asset Tracing', description: 'Tracing and recovering assets' },
    { value: 'data_analysis', label: 'Data Analysis', description: 'Financial data analysis and pattern recognition' }
  ];

  const handleGenerate = async () => {
    if (!formData.difficulty || (!formData.topic && !formData.customTopic)) {
      setError('Please select difficulty and topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const topic = formData.topic === 'custom' ? formData.customTopic : formData.topic;
      
      const response = await apiClient.request('/challenges/generate', {
        method: 'POST',
        body: JSON.stringify({
          job_id: jobId,
          difficulty: formData.difficulty,
          topic: topic
        })
      });

      setGeneratedChallenge(response);
    } catch (err) {
      setError(err.message || 'Failed to generate challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachToJob = async () => {
    if (!generatedChallenge) return;

    try {
      // Call the parent callback to handle attaching challenge to job
      if (onChallengeGenerated) {
        await onChallengeGenerated(generatedChallenge);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to attach challenge to job');
    }
  };

  const handleClose = () => {
    setGeneratedChallenge(null);
    setFormData({ difficulty: '', topic: '', customTopic: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <span>Generate AI Challenge for {jobTitle}</span>
          </DialogTitle>
        </DialogHeader>

        {!generatedChallenge ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        <div>
                          <div className="font-medium">{diff.label}</div>
                          <div className="text-sm text-slate-500">{diff.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Challenge Topic</Label>
                <Select 
                  value={formData.topic} 
                  onValueChange={(value) => setFormData({ ...formData, topic: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select challenge topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedTopics.map((topic) => (
                      <SelectItem key={topic.value} value={topic.value}>
                        <div>
                          <div className="font-medium">{topic.label}</div>
                          <div className="text-sm text-slate-500">{topic.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <div>
                        <div className="font-medium">Custom Topic</div>
                        <div className="text-sm text-slate-500">Enter your own topic</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.topic === 'custom' && (
                <div>
                  <Label htmlFor="customTopic">Custom Topic</Label>
                  <Input
                    id="customTopic"
                    value={formData.customTopic}
                    onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
                    placeholder="Enter custom topic (e.g., bankruptcy analysis, tax fraud investigation)"
                  />
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-800">AI Challenge Generation</span>
              </div>
              <p className="text-sm text-blue-700">
                Our AI will create a realistic forensic accounting challenge with a detailed scenario, 
                answer key, and scoring rubric tailored to your job requirements.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-800">Challenge Generated Successfully!</span>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline">{formData.difficulty}</Badge>
                <Badge variant="outline">{formData.topic}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Challenge Question</Label>
                <div className="mt-2 p-4 bg-slate-50 border rounded-lg">
                  <p className="whitespace-pre-wrap">{generatedChallenge.prompt}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Answer Key Preview</Label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="text-green-800">
                      {generatedChallenge.answer_key?.substring(0, 150)}...
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Scoring Rubric Preview</Label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="text-blue-800">
                      {generatedChallenge.scoring_rubric?.substring(0, 150)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedChallenge ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Challenge
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setGeneratedChallenge(null)}>
                Generate Another
              </Button>
              <Button onClick={handleAttachToJob}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Attach to Job
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
