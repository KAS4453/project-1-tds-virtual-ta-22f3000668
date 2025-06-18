import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, TestTube, Brain, Server, Shield, Key } from "lucide-react";

interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

interface AIConfig {
  primaryModel: string;
  embeddingModel: string;
  temperature: number;
  maxTokens: number;
}

interface APIConfig {
  rateLimit: number;
  requestTimeout: number;
  maxImageSize: number;
  enableAuth: boolean;
  logRequests: boolean;
}

export default function Configuration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    primaryModel: "gpt-3.5-turbo",
    embeddingModel: "text-embedding-ada-002",
    temperature: 0.7,
    maxTokens: 2048,
  });

  const [apiConfig, setApiConfig] = useState<APIConfig>({
    rateLimit: 60,
    requestTimeout: 30,
    maxImageSize: 10,
    enableAuth: true,
    logRequests: true,
  });

  const [envVars, setEnvVars] = useState({
    openaiApiKey: "",
    databaseUrl: "",
    redisUrl: "",
  });

  const { data: systemConfigs, isLoading } = useQuery<SystemConfig[]>({
    queryKey: ["/api/config"],
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: { key: string; value: string; description?: string }) => {
      const result = await apiRequest("POST", "/api/config", configData);
      return result.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      // Test API connection with current configuration
      const result = await apiRequest("POST", "/api/test", {
        question: "Test configuration connection"
      });
      return result.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All connections are working properly",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connections",
        variant: "destructive",
      });
    },
  });

  const handleSaveAIConfig = async () => {
    const configs = [
      { key: "openai_model", value: aiConfig.primaryModel, description: "Primary OpenAI model for responses" },
      { key: "embedding_model", value: aiConfig.embeddingModel, description: "OpenAI embedding model" },
      { key: "temperature", value: aiConfig.temperature.toString(), description: "LLM temperature setting" },
      { key: "max_tokens", value: aiConfig.maxTokens.toString(), description: "Maximum tokens for LLM responses" },
    ];

    for (const config of configs) {
      await saveConfigMutation.mutateAsync(config);
    }
  };

  const handleSaveAPIConfig = async () => {
    const configs = [
      { key: "rate_limit", value: apiConfig.rateLimit.toString(), description: "API rate limit per minute" },
      { key: "request_timeout", value: apiConfig.requestTimeout.toString(), description: "Request timeout in seconds" },
      { key: "max_image_size", value: apiConfig.maxImageSize.toString(), description: "Maximum image size in MB" },
      { key: "enable_auth", value: apiConfig.enableAuth.toString(), description: "Enable API key authentication" },
      { key: "log_requests", value: apiConfig.logRequests.toString(), description: "Log all API requests" },
    ];

    for (const config of configs) {
      await saveConfigMutation.mutateAsync(config);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">System Configuration</h1>
        <p className="text-gray-600">Configure AI models, API settings, and system parameters</p>
      </div>

      {/* AI Model Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Brain className="mr-3 text-purple-600" size={24} />
            <CardTitle className="text-lg font-semibold text-gray-900">AI Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Primary LLM Model</Label>
              <Select 
                value={aiConfig.primaryModel}
                onValueChange={(value) => setAiConfig(prev => ({ ...prev, primaryModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="llama-2">Llama 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Embedding Model</Label>
              <Select 
                value={aiConfig.embeddingModel}
                onValueChange={(value) => setAiConfig(prev => ({ ...prev, embeddingModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                  <SelectItem value="sentence-transformers">Sentence Transformers</SelectItem>
                  <SelectItem value="openai-embeddings-v2">OpenAI Embeddings v2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Temperature</Label>
              <div className="px-2">
                <Slider
                  value={[aiConfig.temperature]}
                  onValueChange={([value]) => setAiConfig(prev => ({ ...prev, temperature: value }))}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Deterministic (0)</span>
                  <span className="font-medium">{aiConfig.temperature}</span>
                  <span>Creative (2)</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Max Tokens</Label>
              <Input
                type="number"
                min="100"
                max="4000"
                value={aiConfig.maxTokens}
                onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              />
            </div>

            <Button 
              onClick={handleSaveAIConfig}
              disabled={saveConfigMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="mr-2" size={16} />
                  Save AI Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Server className="mr-3 text-blue-600" size={24} />
            <CardTitle className="text-lg font-semibold text-gray-900">API Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/minute)</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={apiConfig.rateLimit}
                onChange={(e) => setApiConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Request Timeout (seconds)</Label>
              <Input
                type="number"
                min="5"
                max="120"
                value={apiConfig.requestTimeout}
                onChange={(e) => setApiConfig(prev => ({ ...prev, requestTimeout: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Max Image Size (MB)</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={apiConfig.maxImageSize}
                onChange={(e) => setApiConfig(prev => ({ ...prev, maxImageSize: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-auth"
                  checked={apiConfig.enableAuth}
                  onCheckedChange={(checked) => setApiConfig(prev => ({ ...prev, enableAuth: !!checked }))}
                />
                <Label htmlFor="enable-auth" className="text-sm text-gray-700">
                  Enable API key authentication
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="log-requests"
                  checked={apiConfig.logRequests}
                  onCheckedChange={(checked) => setApiConfig(prev => ({ ...prev, logRequests: !!checked }))}
                />
                <Label htmlFor="log-requests" className="text-sm text-gray-700">
                  Log all API requests
                </Label>
              </div>
            </div>

            <Button 
              onClick={handleSaveAPIConfig}
              disabled={saveConfigMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="mr-2" size={16} />
                  Save API Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <Key className="mr-3 text-amber-600" size={24} />
          <CardTitle className="text-lg font-semibold text-gray-900">Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label className="text-sm font-medium text-gray-700">OPENAI_API_KEY</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={envVars.openaiApiKey}
                onChange={(e) => setEnvVars(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                className="col-span-2 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label className="text-sm font-medium text-gray-700">DATABASE_URL</Label>
              <Input
                type="password"
                placeholder="postgresql://..."
                value={envVars.databaseUrl}
                onChange={(e) => setEnvVars(prev => ({ ...prev, databaseUrl: e.target.value }))}
                className="col-span-2 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Label className="text-sm font-medium text-gray-700">REDIS_URL</Label>
              <Input
                type="password"
                placeholder="redis://..."
                value={envVars.redisUrl}
                onChange={(e) => setEnvVars(prev => ({ ...prev, redisUrl: e.target.value }))}
                className="col-span-2 font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <Button 
              onClick={() => handleSaveAIConfig()}
              disabled={saveConfigMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Settings className="mr-2" size={16} />
              Save Configuration
            </Button>
            <Button 
              variant="outline"
              onClick={() => testConnectionMutation.mutate()}
              disabled={testConnectionMutation.isPending}
            >
              {testConnectionMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-2" size={16} />
                  Test Connections
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
