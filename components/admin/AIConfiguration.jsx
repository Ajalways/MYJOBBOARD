import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Brain, Zap, CheckCircle, AlertCircle, Save, TestTube, RefreshCw } from 'lucide-react';
import { Core } from '@/api/integrations';

export default function AIConfiguration() {
  const [aiConfig, setAiConfig] = useState({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    enabled: false
  });
  
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    enabled: false
  });

  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [saving, setSaving] = useState(false);

  const aiProviders = [
    { value: 'openai', label: 'OpenAI (GPT-4)', description: 'Best for complex forensic scenarios' },
    { value: 'anthropic', label: 'Anthropic (Claude)', description: 'Excellent for analytical tasks' },
    { value: 'azure', label: 'Azure OpenAI', description: 'Enterprise-grade security' }
  ];

  const forensicPromptTemplates = {
    fraud_detection: `You are an expert forensic accountant specializing in fraud detection. Create a realistic challenge scenario involving {skill_level} level fraud analysis in {industry}. 

The scenario should include:
- Background company information
- Financial data with embedded anomalies
- Multiple analytical tasks (ratio analysis, trend analysis, etc.)
- Red flags to identify
- Documentation requirements

Difficulty: {difficulty}
Focus Areas: {focus_areas}

Generate a detailed, realistic scenario with supporting data.`,

    financial_investigation: `Create a forensic accounting investigation scenario for {skill_level} professionals. 

Include:
- Case background and allegations
- Financial statements and documents
- Investigation procedures to follow
- Evidence to analyze
- Reporting requirements

Industry: {industry}
Complexity: {difficulty}
Key Skills: {focus_areas}`,

    litigation_support: `Generate a litigation support challenge for forensic accountants at {skill_level} level.

Components:
- Legal case background
- Financial evidence review
- Expert witness preparation
- Damage calculation scenarios
- Court-ready analysis

Setting: {industry}
Difficulty: {difficulty}
Focus: {focus_areas}`
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Load existing configurations from backend
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const config = await response.json();
        setAiConfig(config.ai || aiConfig);
        setStripeConfig(config.stripe || stripeConfig);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai: aiConfig,
          stripe: stripeConfig
        })
      });

      if (response.ok) {
        setTestResults({ config: { success: true, message: 'Configuration saved successfully!' } });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      setTestResults({ config: { success: false, message: error.message } });
    } finally {
      setSaving(false);
    }
  };

  const testAIConnection = async () => {
    setTesting(true);
    try {
      const testPrompt = "Generate a brief forensic accounting scenario for testing purposes.";
      const result = await Core.InvokeLLM(testPrompt, {
        provider: aiConfig.provider,
        model: aiConfig.model,
        temperature: aiConfig.temperature,
        maxTokens: 200
      });

      setTestResults({ 
        ai: { 
          success: result.success, 
          message: result.success ? 'AI connection successful!' : result.error,
          response: result.response
        } 
      });
    } catch (error) {
      setTestResults({ ai: { success: false, message: error.message } });
    } finally {
      setTesting(false);
    }
  };

  const testStripeConnection = async () => {
    setTesting(true);
    try {
      // Test Stripe connection
      const response = await fetch('/api/admin/test-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeConfig)
      });

      const result = await response.json();
      setTestResults({ 
        stripe: { 
          success: result.success, 
          message: result.message 
        } 
      });
    } catch (error) {
      setTestResults({ stripe: { success: false, message: error.message } });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI & Integration Configuration</h2>
          <p className="text-slate-600">Configure AI providers and payment processing for your platform</p>
        </div>
        <Button 
          onClick={saveConfiguration} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="stripe">
            <Zap className="w-4 h-4 mr-2" />
            Stripe Payments
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Settings className="w-4 h-4 mr-2" />
            Challenge Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI Challenge Generation</Label>
                  <p className="text-sm text-slate-600">Allow companies to generate AI-powered challenges</p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={aiConfig.enabled}
                  onCheckedChange={(checked) => setAiConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ai-provider">AI Provider</Label>
                  <Select 
                    value={aiConfig.provider} 
                    onValueChange={(value) => setAiConfig(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div>
                            <div className="font-medium">{provider.label}</div>
                            <div className="text-sm text-slate-600">{provider.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ai-model">Model</Label>
                  <Select 
                    value={aiConfig.model} 
                    onValueChange={(value) => setAiConfig(prev => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your AI provider API key"
                  />
                </div>

                <div>
                  <Label htmlFor="temperature">Creativity Level (Temperature)</Label>
                  <Select 
                    value={aiConfig.temperature.toString()} 
                    onValueChange={(value) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.3">0.3 - Conservative (Consistent)</SelectItem>
                      <SelectItem value="0.7">0.7 - Balanced (Recommended)</SelectItem>
                      <SelectItem value="1.0">1.0 - Creative (Varied)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={testAIConnection} 
                  disabled={testing || !aiConfig.apiKey}
                  variant="outline"
                >
                  {testing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Test AI Connection
                </Button>

                {testResults.ai && (
                  <Alert className={testResults.ai.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {testResults.ai.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Stripe Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stripe-enabled">Enable Stripe Payments</Label>
                  <p className="text-sm text-slate-600">Accept payments for premium features and challenges</p>
                </div>
                <Switch
                  id="stripe-enabled"
                  checked={stripeConfig.enabled}
                  onCheckedChange={(checked) => setStripeConfig(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="stripe-publishable">Publishable Key</Label>
                  <Input
                    id="stripe-publishable"
                    value={stripeConfig.publishableKey}
                    onChange={(e) => setStripeConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
                    placeholder="pk_live_... or pk_test_..."
                  />
                </div>

                <div>
                  <Label htmlFor="stripe-secret">Secret Key</Label>
                  <Input
                    id="stripe-secret"
                    type="password"
                    value={stripeConfig.secretKey}
                    onChange={(e) => setStripeConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="sk_live_... or sk_test_..."
                  />
                </div>

                <div>
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <Input
                    id="stripe-webhook"
                    type="password"
                    value={stripeConfig.webhookSecret}
                    onChange={(e) => setStripeConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    placeholder="whsec_..."
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={testStripeConnection} 
                  disabled={testing || !stripeConfig.secretKey}
                  variant="outline"
                >
                  {testing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                  Test Stripe Connection
                </Button>

                {testResults.stripe && (
                  <Alert className={testResults.stripe.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {testResults.stripe.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Setup Instructions:</strong><br />
                  1. Create a Stripe account at stripe.com<br />
                  2. Get your API keys from the Stripe Dashboard<br />
                  3. Set up webhooks pointing to: {window.location.origin}/api/payments/webhook<br />
                  4. Test with small amounts before going live
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Forensic Accounting Challenge Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(forensicPromptTemplates).map(([key, template]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{key.replace('_', ' ')}</h4>
                    <Badge variant="outline">Template</Badge>
                  </div>
                  <Textarea
                    value={template}
                    readOnly
                    className="min-h-[120px] text-sm font-mono"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Variables: {key}, skill_level, industry, difficulty, focus_areas
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testResults.config && (
        <Alert className={testResults.config.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {testResults.config.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
