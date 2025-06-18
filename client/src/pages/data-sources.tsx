import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FolderSync, Settings, Book, MessageSquare, Database, Cog } from "lucide-react";

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

interface SyncConfig {
  courseContentFrom: string;
  courseContentTo: string;
  discourseFrom: string;
  discourseTo: string;
  syncFrequency: string;
  maxConcurrentRequests: number;
}

export default function DataSources() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<SyncConfig>({
    courseContentFrom: "2025-01-01",
    courseContentTo: "2025-04-15",
    discourseFrom: "2025-01-01",
    discourseTo: "2025-04-14",
    syncFrequency: "daily",
    maxConcurrentRequests: 5,
  });

  const { data: dataStatus, isLoading } = useQuery<DataSourceStatus>({
    queryKey: ["/api/data-sources/status"],
    refetchInterval: 30000,
  });

  const syncCourseMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/data-sources/sync-course", {
        dateFrom: config.courseContentFrom,
        dateTo: config.courseContentTo,
      });
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Course content sync completed. ${data.itemsProcessed} items processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources/status"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "FolderSync failed",
        variant: "destructive",
      });
    },
  });

  const syncDiscourseMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/data-sources/sync-discourse", {
        dateFrom: config.discourseFrom,
        dateTo: config.discourseTo,
      });
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Discourse sync completed. ${data.itemsProcessed} items processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources/status"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "FolderSync failed",
        variant: "destructive",
      });
    },
  });

  const reindexMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/data-sources/reindex-vectors");
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Reindexing failed",
        variant: "destructive",
      });
    },
  });

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Less than 1 hour ago";
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Data Sources Management</h1>
        <p className="text-gray-600">Monitor and manage your data scraping operations</p>
      </div>

      {/* Data Source Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Course Content</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <Book className="text-green-600" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Source URL</span>
                <span className="text-gray-900 font-mono text-xs">tds.s-anand.net</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">
                  {isLoading ? "Loading..." : formatTime(dataStatus?.courseContent.lastUpdated || null)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Documents</span>
                <span className="text-gray-900 font-semibold">
                  {dataStatus?.courseContent.count || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => syncCourseMutation.mutate()}
              disabled={syncCourseMutation.isPending}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              {syncCourseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <FolderSync className="mr-2" size={16} />
                  FolderSync Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Discourse Forum</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="text-blue-600" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Source URL</span>
                <span className="text-gray-900 font-mono text-xs">discourse.onlinedegree.iitm.ac.in</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">
                  {isLoading ? "Loading..." : formatTime(dataStatus?.discoursePosts.lastUpdated || null)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Posts</span>
                <span className="text-gray-900 font-semibold">
                  {dataStatus?.discoursePosts.count || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => syncDiscourseMutation.mutate()}
              disabled={syncDiscourseMutation.isPending}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              {syncDiscourseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <FolderSync className="mr-2" size={16} />
                  FolderSync Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Vector Database</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Database className="text-purple-600" size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Embeddings</span>
                <span className="text-gray-900 font-semibold">89,432</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Index Size</span>
                <span className="text-gray-900">2.4 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Query Time</span>
                <span className="text-gray-900">0.12s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Optimal
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              {reindexMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reindexing...
                </>
              ) : (
                <>
                  <Cog className="mr-2" size={16} />
                  Reindex
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Scraping Configuration */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Scraping Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Course Content Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={config.courseContentFrom}
                  onChange={(e) => setConfig(prev => ({ ...prev, courseContentFrom: e.target.value }))}
                />
                <Input
                  type="date"
                  value={config.courseContentTo}
                  onChange={(e) => setConfig(prev => ({ ...prev, courseContentTo: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Discourse Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={config.discourseFrom}
                  onChange={(e) => setConfig(prev => ({ ...prev, discourseFrom: e.target.value }))}
                />
                <Input
                  type="date"
                  value={config.discourseTo}
                  onChange={(e) => setConfig(prev => ({ ...prev, discourseTo: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">FolderSync Frequency</Label>
              <Select 
                value={config.syncFrequency}
                onValueChange={(value) => setConfig(prev => ({ ...prev, syncFrequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Max Concurrent Requests</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={config.maxConcurrentRequests}
                onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentRequests: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Settings className="mr-2" size={16} />
              Save Configuration
            </Button>
            <Button variant="outline">
              <FolderSync className="mr-2" size={16} />
              Test Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
