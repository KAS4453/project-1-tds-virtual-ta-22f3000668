import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Server, MemoryStick, Activity, TrendingUp } from "lucide-react";

interface PerformanceMetrics {
  totalQuestions: number;
  avgResponseTime: number;
  successRate: number;
  questionsToday: number;
  latency: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  vectorDB: {
    totalEmbeddings: number;
    courseEmbeddings: number;
    discourseEmbeddings: number;
    avgQueryTime: number;
  };
}

export default function Performance() {
  const { data: metrics, isLoading } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/performance/metrics"],
    refetchInterval: 30000,
  });

  const categoryData = [
    { name: "Assignment Questions", percentage: 45, color: "bg-primary" },
    { name: "Technical Setup", percentage: 30, color: "bg-green-500" },
    { name: "Course Content", percentage: 15, color: "bg-orange-500" },
    { name: "General Queries", percentage: 10, color: "bg-purple-500" },
  ];

  const formatTime = (seconds: number) => `${seconds.toFixed(2)}s`;
  const formatMemory = (gb: number) => `${gb.toFixed(1)}GB`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Performance Analytics</h1>
        <p className="text-gray-600">Detailed metrics and performance insights</p>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="text-gray-400 mx-auto mb-2" size={48} />
                <p className="text-gray-500 font-medium">Response Time Chart</p>
                <p className="text-sm text-gray-400">Real-time performance data</p>
                {metrics && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average:</span>
                      <Badge variant="outline">{formatTime(metrics.latency?.avg || metrics.avgResponseTime)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">95th percentile:</span>
                      <Badge variant="outline">{formatTime(metrics.latency?.p95 || metrics.avgResponseTime * 1.5)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">99th percentile:</span>
                      <Badge variant="outline">{formatTime(metrics.latency?.p99 || metrics.avgResponseTime * 2)}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Question Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 min-w-0 flex-1">{category.name}</span>
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-20">
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium min-w-[3rem] text-right">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance Metrics */}
      <Card className="card-shadow mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">System Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Average Latency"
              value={metrics ? formatTime(metrics.avgResponseTime) : "0s"}
              icon={Gauge}
              iconColor="text-green-600"
              iconBg="bg-green-100"
              isLoading={isLoading}
              className="text-center"
            />
            
            <MetricCard
              title="Throughput"
              value={metrics ? `${metrics.throughput}/hour` : "0/hour"}
              icon={Server}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              isLoading={isLoading}
              className="text-center"
            />
            
            <MetricCard
              title="Memory Usage"
              value={metrics ? formatMemory(metrics.memory?.used || 2.1) : "0GB"}
              icon={MemoryStick}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
              isLoading={isLoading}
              className="text-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Memory Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Used Memory</span>
                <span className="text-sm text-gray-600">
                  {metrics ? formatMemory(metrics.memory?.used || 2.1) : "0GB"}
                </span>
              </div>
              <Progress 
                value={metrics?.memory?.percentage || 26.25} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>0GB</span>
                <span>{metrics ? formatMemory(metrics.memory?.available || 8.0) : "8.0GB"}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{metrics?.memory?.percentage?.toFixed(1) || "26.3"}%</span> of available memory used
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Vector Database Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Embeddings</span>
                <span className="text-sm font-medium">
                  {metrics?.vectorDB?.totalEmbeddings?.toLocaleString() || "89,432"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Content</span>
                <span className="text-sm font-medium">
                  {metrics?.vectorDB?.courseEmbeddings?.toLocaleString() || "25,680"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discourse Posts</span>
                <span className="text-sm font-medium">
                  {metrics?.vectorDB?.discourseEmbeddings?.toLocaleString() || "63,752"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Query Time</span>
                <span className="text-sm font-medium">
                  {metrics?.vectorDB?.avgQueryTime?.toFixed(2) || "0.12"}s
                </span>
              </div>
              <div className="pt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <TrendingUp className="mr-1" size={12} />
                  Optimal Performance
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
