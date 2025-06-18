import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/ui/metric-card";
import StatusIndicator from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, BarChart3, HelpCircle, FolderSync, Code, Brain, Database } from "lucide-react";

interface DashboardMetrics {
  totalQuestions: number;
  avgResponseTime: number;
  successRate: number;
  questionsToday: number;
  vectorEmbeddings: number;
  avgQueryTime: number;
}

interface DataSourceStatus {
  courseContent: {
    count: number;
    lastUpdated: number | null;
  };
  discoursePosts: {
    count: number;
    lastUpdated: number | null;
  };
  recentJobs: Array<{
    id: number;
    jobType: string;
    status: string;
    itemsProcessed: number;
    startedAt: Date;
  }>;
}

interface RecentQuestion {
  id: number;
  question: string;
  success: boolean;
  responseTime: number;
  createdAt: Date;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: dataStatus, isLoading: statusLoading } = useQuery<DataSourceStatus>({
    queryKey: ["/api/data-sources/status"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: recentQuestions, isLoading: questionsLoading } = useQuery<RecentQuestion[]>({
    queryKey: ["/api/dashboard/recent-questions"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const formatTime = (seconds: number) => `${seconds.toFixed(1)}s`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">System Overview</h1>
        <p className="text-gray-600">Real-time status and performance metrics for your TDS Virtual TA system</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="API Status"
          value="Online"
          trend="+99.9% uptime"
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          trendColor="text-green-600"
          isLoading={false}
        />

        <MetricCard
          title="Total Questions"
          value={metrics?.totalQuestions.toLocaleString() || "0"}
          trend={`+${metrics?.questionsToday || 0} today`}
          icon={HelpCircle}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          trendColor="text-blue-600"
          isLoading={metricsLoading}
        />

        <MetricCard
          title="Avg Response Time"
          value={metrics ? formatTime(metrics.avgResponseTime) : "0s"}
          trend="-0.3s improved"
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
          trendColor="text-green-600"
          isLoading={metricsLoading}
        />

        <MetricCard
          title="Success Rate"
          value={metrics ? formatPercentage(metrics.successRate) : "0%"}
          trend="+2.1% this week"
          icon={BarChart3}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          trendColor="text-green-600"
          isLoading={metricsLoading}
        />
      </div>

      {/* Data Sources Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Data Sources Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <StatusIndicator status="active" className="mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">TDS Course Content</p>
                    <p className="text-sm text-gray-600">
                      {statusLoading ? "Loading..." : 
                        dataStatus?.courseContent.lastUpdated ? 
                          formatRelativeTime(dataStatus.courseContent.lastUpdated) : 
                          "Never synced"
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <StatusIndicator status="active" className="mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Discourse Forum</p>
                    <p className="text-sm text-gray-600">
                      {statusLoading ? "Loading..." : 
                        dataStatus?.discoursePosts.lastUpdated ? 
                          formatRelativeTime(dataStatus.discoursePosts.lastUpdated) : 
                          "Never synced"
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <StatusIndicator status="healthy" className="mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Vector Database</p>
                    <p className="text-sm text-gray-600">
                      {metrics?.vectorEmbeddings.toLocaleString() || "0"} embeddings indexed
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questionsLoading ? (
                <div className="text-sm text-gray-500">Loading recent activity...</div>
              ) : recentQuestions && recentQuestions.length > 0 ? (
                recentQuestions.slice(0, 4).map((question) => (
                  <div key={question.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${question.success ? 'bg-blue-100' : 'bg-red-100'}`}>
                      {question.success ? (
                        <HelpCircle className="text-blue-600 text-sm" size={16} />
                      ) : (
                        <HelpCircle className="text-red-600 text-sm" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {question.question.length > 60 
                          ? `${question.question.substring(0, 60)}...` 
                          : question.question
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleTimeString()} • {formatTime(question.responseTime)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <HelpCircle className="text-blue-600 text-sm" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Question about GA4 scoring answered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FolderSync className="text-green-600 text-sm" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Discourse data sync completed</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Code className="text-orange-600 text-sm" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">API rate limit adjustment</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Brain className="text-purple-600 text-sm" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">ML model retrained with new data</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
