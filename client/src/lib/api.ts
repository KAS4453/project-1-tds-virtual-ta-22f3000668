import { apiRequest } from "./queryClient";

export interface ApiTestRequest {
  question: string;
  image?: string;
}

export interface ApiTestResponse {
  answer: string;
  links: Array<{
    url: string;
    text: string;
  }>;
}

export interface DashboardMetrics {
  totalQuestions: number;
  avgResponseTime: number;
  successRate: number;
  questionsToday: number;
  vectorEmbeddings: number;
  avgQueryTime: number;
}

export interface DataSourceStatus {
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

export interface SyncRequest {
  dateFrom?: string;
  dateTo?: string;
}

export interface SyncResponse {
  success: boolean;
  itemsProcessed: number;
  error?: string;
}

export interface ConfigItem {
  key: string;
  value: string;
  description?: string;
}

export class ApiClient {
  // Test API endpoint
  async testApi(request: ApiTestRequest): Promise<ApiTestResponse> {
    const response = await apiRequest("POST", "/api", request);
    return response.json();
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  }

  async getRecentQuestions(limit = 10) {
    const response = await apiRequest("GET", `/api/dashboard/recent-questions?limit=${limit}`);
    return response.json();
  }

  // Data sources endpoints
  async getDataSourceStatus(): Promise<DataSourceStatus> {
    const response = await apiRequest("GET", "/api/data-sources/status");
    return response.json();
  }

  async syncCourseContent(request: SyncRequest): Promise<SyncResponse> {
    const response = await apiRequest("POST", "/api/data-sources/sync-course", request);
    return response.json();
  }

  async syncDiscourse(request: SyncRequest): Promise<SyncResponse> {
    const response = await apiRequest("POST", "/api/data-sources/sync-discourse", request);
    return response.json();
  }

  async reindexVectors(): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest("POST", "/api/data-sources/reindex-vectors");
    return response.json();
  }

  // Configuration endpoints
  async getConfig() {
    const response = await apiRequest("GET", "/api/config");
    return response.json();
  }

  async setConfig(config: ConfigItem): Promise<{ success: boolean }> {
    const response = await apiRequest("POST", "/api/config", config);
    return response.json();
  }

  // Performance endpoints
  async getPerformanceMetrics() {
    const response = await apiRequest("GET", "/api/performance/metrics");
    return response.json();
  }

  // Scraping jobs endpoints
  async getScrapingJobs() {
    const response = await apiRequest("GET", "/api/scraping-jobs");
    return response.json();
  }

  // Test endpoint
  async testConnection(question: string) {
    const response = await apiRequest("POST", "/api/test", { question });
    return response.json();
  }
}

export const apiClient = new ApiClient();
