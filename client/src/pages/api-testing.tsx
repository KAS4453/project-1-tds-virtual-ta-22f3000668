import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Copy, Download, Upload, FileImage } from "lucide-react";

interface ApiResponse {
  answer: string;
  links: Array<{
    url: string;
    text: string;
  }>;
}

export default function ApiTesting() {
  const [endpoint, setEndpoint] = useState("https://app.example.com/api/");
  const [question, setQuestion] = useState("Should I use gpt-4o-mini which AI proxy supports, or gpt3.5 turbo?");
  const [image, setImage] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [status, setStatus] = useState<string>("200 OK");
  
  const { toast } = useToast();

  const testApiMutation = useMutation({
    mutationFn: async (data: { question: string; image?: string }) => {
      const startTime = Date.now();
      const result = await apiRequest("POST", "/api", data);
      const endTime = Date.now();
      setResponseTime((endTime - startTime) / 1000);
      return result.json();
    },
    onSuccess: (data) => {
      setResponse(data);
      setStatus("200 OK");
      toast({
        title: "Success",
        description: "API request completed successfully",
      });
    },
    onError: (error) => {
      setStatus("500 Error");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "API request failed",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Question is required",
        variant: "destructive",
      });
      return;
    }

    const requestData: { question: string; image?: string } = { question };
    if (image) {
      requestData.image = image;
    }

    testApiMutation.mutate(requestData);
  };

  const loadSampleQuestion = (sampleQuestion: string) => {
    setQuestion(sampleQuestion);
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    }
  };

  const sampleQuestions = [
    {
      title: "GA4 Scoring Question",
      question: "If a student scores 10/10 on GA4 as well as a bonus, how would it appear on the dashboard?"
    },
    {
      title: "Docker vs Podman",
      question: "I know Docker but have not used Podman before. Should I use Docker for this course?"
    },
    {
      title: "GPT Model Selection",
      question: "Should I use gpt-4o-mini which AI proxy supports, or gpt3.5 turbo?"
    },
    {
      title: "Future Exam Dates",
      question: "When is the TDS Sep 2025 end-term exam?"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">API Testing Interface</h1>
        <p className="text-gray-600">Test your Virtual TA API endpoints with live examples</p>
      </div>

      {/* Main Testing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Test API Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">API Endpoint</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  POST
                </span>
                <Input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="rounded-l-none"
                  placeholder="https://app.example.com/api/"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Question</Label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Enter student question here..."
                className="resize-none"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Image Attachment (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {image ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileImage className="text-green-500" size={24} />
                      <span className="text-sm text-green-700">Image uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-gray-400 mx-auto mb-2" size={24} />
                      <p className="text-sm text-gray-600">Drop image here or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">Will be converted to base64</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={testApiMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {testApiMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2" size={16} />
                  Send Test Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Response Status</span>
                <Badge variant={status.includes("200") ? "default" : "destructive"}>
                  {status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-sm text-gray-600">{responseTime.toFixed(2)}s</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-800">
                {response ? (
                  <code>
{JSON.stringify({
  "answer": response.answer,
  "links": response.links
}, null, 2)}
                  </code>
                ) : (
                  <code className="text-gray-500">
{`{
  "answer": "Response will appear here...",
  "links": []
}`}
                  </code>
                )}
              </pre>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyResponse}
                disabled={!response}
                className="flex-1"
              >
                <Copy className="mr-1" size={14} />
                Copy Response
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!response}
                className="flex-1"
              >
                <Download className="mr-1" size={14} />
                Save Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Questions */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Sample Test Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleQuestions.map((sample, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => loadSampleQuestion(sample.question)}
              >
                <h4 className="font-medium text-gray-900 mb-2">{sample.title}</h4>
                <p className="text-sm text-gray-600">{sample.question}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
