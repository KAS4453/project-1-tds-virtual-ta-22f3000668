import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Database,
  MessageSquare
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  category: "api" | "scraping" | "system" | "database";
  message: string;
  metadata?: any;
}

interface ScrapingJob {
  id: number;
  jobType: string;
  status: string;
  startedAt: Date;
  completedAt?: Date;
  itemsProcessed: number;
  errorMessage?: string;
}

interface ApiQuestion {
  id: number;
  question: string;
  success: boolean;
  responseTime: number;
  createdAt: Date;
  errorMessage?: string;
}

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [category, setCategory] = useState("all");

  const { data: scrapingJobs, isLoading: jobsLoading } = useQuery<{
    active: ScrapingJob[];
    recent: ScrapingJob[];
  }>({
    queryKey: ["/api/scraping-jobs"],
    refetchInterval: 30000,
  });

  const { data: recentQuestions, isLoading: questionsLoading } = useQuery<ApiQuestion[]>({
    queryKey: ["/api/dashboard/recent-questions"],
    refetchInterval: 15000,
  });

  // Mock system logs for demonstration
  const mockLogs: LogEntry[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: "info",
      category: "api",
      message: "API request processed successfully",
      metadata: { endpoint: "/api", responseTime: "2.34s", status: 200 }
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      level: "info",
      category: "scraping",
      message: "Discourse data sync completed",
      metadata: { itemsProcessed: 47, duration: "3.2s" }
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      level: "warn",
      category: "system",
      message: "Rate limit threshold reached",
      metadata: { threshold: 80, current: 85 }
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      level: "info",
      category: "database",
      message: "Vector database reindexing completed",
      metadata: { embeddingsCount: 89432, duration: "45.2s" }
    },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="text-red-500" size={16} />;
      case "warn":
        return <AlertCircle className="text-amber-500" size={16} />;
      case "info":
        return <CheckCircle className="text-blue-500" size={16} />;
      case "debug":
        return <Clock className="text-gray-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "api":
        return <Zap className="text-blue-500" size={16} />;
      case "scraping":
        return <Download className="text-green-500" size={16} />;
      case "database":
        return <Database className="text-purple-500" size={16} />;
      case "system":
        return <MessageSquare className="text-orange-500" size={16} />;
      default:
        return <FileText className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-700">Running</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === "all" || log.level === logLevel;
    const matchesCategory = category === "all" || log.category === category;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Logs & Monitoring</h1>
        <p className="text-gray-600">Monitor system activity, API requests, and troubleshoot issues</p>
      </div>

      {/* Controls */}
      <Card className="card-shadow mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="scraping">Scraping</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2" size={16} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2" size={16} />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="api">API Requests</TabsTrigger>
          <TabsTrigger value="scraping">Scraping Jobs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">System Event Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border-l-4 border-gray-200 pl-4 py-2 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getLogIcon(log.level)}
                          {getCategoryIcon(log.category)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{log.message}</p>
                            <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                            {log.metadata && (
                              <div className="mt-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {JSON.stringify(log.metadata)}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {log.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent API Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {questionsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading API requests...</div>
                  ) : recentQuestions && recentQuestions.length > 0 ? (
                    recentQuestions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {question.success ? (
                              <CheckCircle className="text-green-500" size={16} />
                            ) : (
                              <AlertCircle className="text-red-500" size={16} />
                            )}
                            <span className="text-sm font-medium">
                              {question.success ? "Success" : "Failed"}
                            </span>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{question.responseTime.toFixed(2)}s</Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(question.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">
                          {question.question.length > 100 
                            ? `${question.question.substring(0, 100)}...` 
                            : question.question
                          }
                        </p>
                        {question.errorMessage && (
                          <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            Error: {question.errorMessage}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No API requests found</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobsLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : scrapingJobs?.active && scrapingJobs.active.length > 0 ? (
                    scrapingJobs.active.map((job) => (
                      <div key={job.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{job.jobType.replace('_', ' ')}</span>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Started: {formatTimestamp(job.startedAt)}</p>
                          <p>Items processed: {job.itemsProcessed}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No active jobs</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {jobsLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : scrapingJobs?.recent && scrapingJobs.recent.length > 0 ? (
                      scrapingJobs.recent.map((job) => (
                        <div key={job.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{job.jobType.replace('_', ' ')}</span>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Started: {formatTimestamp(job.startedAt)}</p>
                            {job.completedAt && (
                              <p>Completed: {formatTimestamp(job.completedAt)}</p>
                            )}
                            <p>Items processed: {job.itemsProcessed}</p>
                            {job.errorMessage && (
                              <p className="text-red-600 mt-1">Error: {job.errorMessage}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">No recent jobs</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Zap className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold">Response Time</h3>
                  <p className="text-2xl font-bold text-blue-600">2.34s</p>
                  <p className="text-sm text-gray-500">Average latency</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold">Success Rate</h3>
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                  <p className="text-sm text-gray-500">Last 24 hours</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Database className="text-orange-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold">Memory Usage</h3>
                  <p className="text-2xl font-bold text-orange-600">2.1GB</p>
                  <p className="text-sm text-gray-500">Current usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
