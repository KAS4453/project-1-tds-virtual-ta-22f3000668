import { 
  users, courseContent, discoursePosts, vectorEmbeddings, 
  apiQuestions, systemConfig, scrapingJobs,
  type User, type InsertUser, type CourseContent, type InsertCourseContent,
  type DiscoursePost, type InsertDiscoursePost, type VectorEmbedding,
  type ApiQuestion, type SystemConfig, type ScrapingJob
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Course content
  insertCourseContent(content: InsertCourseContent): Promise<CourseContent>;
  getCourseContentByUrl(url: string): Promise<CourseContent | undefined>;
  getAllCourseContent(): Promise<CourseContent[]>;
  searchCourseContent(query: string): Promise<CourseContent[]>;

  // Discourse posts
  insertDiscoursePost(post: InsertDiscoursePost): Promise<DiscoursePost>;
  getDiscoursePostByDiscourseId(discourseId: number): Promise<DiscoursePost | undefined>;
  getAllDiscoursePosts(): Promise<DiscoursePost[]>;
  searchDiscoursePosts(query: string): Promise<DiscoursePost[]>;

  // Vector embeddings
  insertVectorEmbedding(embedding: Omit<VectorEmbedding, 'id' | 'createdAt'>): Promise<VectorEmbedding>;
  findSimilarEmbeddings(embedding: number[], limit: number): Promise<VectorEmbedding[]>;

  // API questions
  insertApiQuestion(question: Omit<ApiQuestion, 'id' | 'createdAt'>): Promise<ApiQuestion>;
  getApiQuestions(limit?: number): Promise<ApiQuestion[]>;
  getApiMetrics(): Promise<{
    totalQuestions: number;
    avgResponseTime: number;
    successRate: number;
    questionsToday: number;
  }>;

  // System configuration
  getConfig(key: string): Promise<string | undefined>;
  setConfig(key: string, value: string, description?: string): Promise<void>;
  getAllConfig(): Promise<SystemConfig[]>;

  // Scraping jobs
  insertScrapingJob(job: Omit<ScrapingJob, 'id'>): Promise<ScrapingJob>;
  updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<void>;
  getActiveScrapingJobs(): Promise<ScrapingJob[]>;
  getRecentScrapingJobs(limit?: number): Promise<ScrapingJob[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private courseContents: Map<number, CourseContent> = new Map();
  private discoursePosts: Map<number, DiscoursePost> = new Map();
  private vectorEmbeddings: Map<number, VectorEmbedding> = new Map();
  private apiQuestions: Map<number, ApiQuestion> = new Map();
  private systemConfigs: Map<string, SystemConfig> = new Map();
  private scrapingJobs: Map<number, ScrapingJob> = new Map();
  
  private currentUserId = 1;
  private currentContentId = 1;
  private currentPostId = 1;
  private currentEmbeddingId = 1;
  private currentQuestionId = 1;
  private currentJobId = 1;

  constructor() {
    // Initialize with default config
    this.systemConfigs.set('openai_model', {
      id: 1,
      key: 'openai_model',
      value: 'gpt-3.5-turbo',
      description: 'Primary OpenAI model for responses',
      updatedAt: new Date(),
    });
    this.systemConfigs.set('embedding_model', {
      id: 2,
      key: 'embedding_model',
      value: 'text-embedding-ada-002',
      description: 'OpenAI embedding model',
      updatedAt: new Date(),
    });
    this.systemConfigs.set('max_tokens', {
      id: 3,
      key: 'max_tokens',
      value: '2048',
      description: 'Maximum tokens for LLM responses',
      updatedAt: new Date(),
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.currentUserId++ };
    this.users.set(user.id, user);
    return user;
  }

  async insertCourseContent(content: InsertCourseContent): Promise<CourseContent> {
    const courseContentItem: CourseContent = {
      ...content,
      id: this.currentContentId++,
      scrapedAt: new Date(),
      lastUpdated: new Date(),
    };
    this.courseContents.set(courseContentItem.id, courseContentItem);
    return courseContentItem;
  }

  async getCourseContentByUrl(url: string): Promise<CourseContent | undefined> {
    return Array.from(this.courseContents.values()).find(content => content.url === url);
  }

  async getAllCourseContent(): Promise<CourseContent[]> {
    return Array.from(this.courseContents.values());
  }

  async searchCourseContent(query: string): Promise<CourseContent[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.courseContents.values()).filter(content =>
      content.title.toLowerCase().includes(lowerQuery) ||
      content.content.toLowerCase().includes(lowerQuery)
    );
  }

  async insertDiscoursePost(post: InsertDiscoursePost): Promise<DiscoursePost> {
    const discoursePost: DiscoursePost = {
      ...post,
      id: this.currentPostId++,
      scrapedAt: new Date(),
    };
    this.discoursePosts.set(discoursePost.id, discoursePost);
    return discoursePost;
  }

  async getDiscoursePostByDiscourseId(discourseId: number): Promise<DiscoursePost | undefined> {
    return Array.from(this.discoursePosts.values()).find(post => post.discourseId === discourseId);
  }

  async getAllDiscoursePosts(): Promise<DiscoursePost[]> {
    return Array.from(this.discoursePosts.values());
  }

  async searchDiscoursePosts(query: string): Promise<DiscoursePost[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.discoursePosts.values()).filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery)
    );
  }

  async insertVectorEmbedding(embedding: Omit<VectorEmbedding, 'id' | 'createdAt'>): Promise<VectorEmbedding> {
    const vectorEmbedding: VectorEmbedding = {
      ...embedding,
      id: this.currentEmbeddingId++,
      createdAt: new Date(),
    };
    this.vectorEmbeddings.set(vectorEmbedding.id, vectorEmbedding);
    return vectorEmbedding;
  }

  async findSimilarEmbeddings(embedding: number[], limit: number): Promise<VectorEmbedding[]> {
    // Simple cosine similarity for in-memory search
    const similarities: Array<{ embedding: VectorEmbedding; similarity: number }> = [];
    
    for (const vecEmb of this.vectorEmbeddings.values()) {
      const storedEmbedding = JSON.parse(vecEmb.embedding);
      const similarity = this.cosineSimilarity(embedding, storedEmbedding);
      similarities.push({ embedding: vecEmb, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.embedding);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async insertApiQuestion(question: Omit<ApiQuestion, 'id' | 'createdAt'>): Promise<ApiQuestion> {
    const apiQuestion: ApiQuestion = {
      ...question,
      id: this.currentQuestionId++,
      createdAt: new Date(),
    };
    this.apiQuestions.set(apiQuestion.id, apiQuestion);
    return apiQuestion;
  }

  async getApiQuestions(limit = 100): Promise<ApiQuestion[]> {
    return Array.from(this.apiQuestions.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async getApiMetrics(): Promise<{
    totalQuestions: number;
    avgResponseTime: number;
    successRate: number;
    questionsToday: number;
  }> {
    const questions = Array.from(this.apiQuestions.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const questionsToday = questions.filter(q => 
      q.createdAt && q.createdAt >= today
    ).length;

    const successfulQuestions = questions.filter(q => q.success);
    const responseTimes = questions
      .filter(q => q.responseTime)
      .map(q => q.responseTime!);

    return {
      totalQuestions: questions.length,
      avgResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0,
      successRate: questions.length > 0 
        ? (successfulQuestions.length / questions.length) * 100
        : 0,
      questionsToday,
    };
  }

  async getConfig(key: string): Promise<string | undefined> {
    return this.systemConfigs.get(key)?.value;
  }

  async setConfig(key: string, value: string, description?: string): Promise<void> {
    const existing = this.systemConfigs.get(key);
    const config: SystemConfig = {
      id: existing?.id || Object.keys(this.systemConfigs).length + 1,
      key,
      value,
      description: description || existing?.description,
      updatedAt: new Date(),
    };
    this.systemConfigs.set(key, config);
  }

  async getAllConfig(): Promise<SystemConfig[]> {
    return Array.from(this.systemConfigs.values());
  }

  async insertScrapingJob(job: Omit<ScrapingJob, 'id'>): Promise<ScrapingJob> {
    const scrapingJob: ScrapingJob = {
      ...job,
      id: this.currentJobId++,
    };
    this.scrapingJobs.set(scrapingJob.id, scrapingJob);
    return scrapingJob;
  }

  async updateScrapingJob(id: number, updates: Partial<ScrapingJob>): Promise<void> {
    const existing = this.scrapingJobs.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.scrapingJobs.set(id, updated);
    }
  }

  async getActiveScrapingJobs(): Promise<ScrapingJob[]> {
    return Array.from(this.scrapingJobs.values()).filter(job => 
      job.status === 'pending' || job.status === 'running'
    );
  }

  async getRecentScrapingJobs(limit = 10): Promise<ScrapingJob[]> {
    return Array.from(this.scrapingJobs.values())
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
