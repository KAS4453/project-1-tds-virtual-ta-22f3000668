import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { webScraper } from "./services/scraper";
import { aiService } from "./services/ai";
import { vectorDB } from "./services/vectordb";
import { imageProcessor } from "./services/image-processor";
import { apiRequestSchema, apiResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Main API endpoint for question answering
  app.post("/api", async (req, res) => {
    try {
      const requestData = apiRequestSchema.parse(req.body);
      
      // Validate image size if provided
      if (requestData.image) {
        const isValidSize = await imageProcessor.validateImageSize(requestData.image);
        if (!isValidSize) {
          return res.status(400).json({ 
            message: "Image too large. Maximum size is 10MB." 
          });
        }
      }

      const response = await aiService.generateResponse(requestData);
      const validatedResponse = apiResponseSchema.parse(response);
      
      res.json(validatedResponse);
      
    } catch (error) {
      console.error('API error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request format",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Dashboard API endpoints
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getApiMetrics();
      const vectorStats = await vectorDB.getEmbeddingStats();
      
      res.json({
        ...metrics,
        vectorEmbeddings: vectorStats.totalEmbeddings,
        avgQueryTime: vectorStats.avgQueryTime,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/dashboard/recent-questions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const questions = await storage.getApiQuestions(limit);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent questions" });
    }
  });

  // Data sources management
  app.get("/api/data-sources/status", async (req, res) => {
    try {
      const courseContent = await storage.getAllCourseContent();
      const discoursePosts = await storage.getAllDiscoursePosts();
      const recentJobs = await storage.getRecentScrapingJobs(5);
      
      res.json({
        courseContent: {
          count: courseContent.length,
          lastUpdated: courseContent.length > 0 
            ? Math.max(...courseContent.map(c => c.lastUpdated?.getTime() || 0))
            : null,
        },
        discoursePosts: {
          count: discoursePosts.length,
          lastUpdated: discoursePosts.length > 0
            ? Math.max(...discoursePosts.map(p => p.scrapedAt?.getTime() || 0))
            : null,
        },
        recentJobs,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources status" });
    }
  });

  app.post("/api/data-sources/sync-course", async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.body;
      const fromDate = dateFrom ? new Date(dateFrom) : new Date('2025-01-01');
      const toDate = dateTo ? new Date(dateTo) : new Date('2025-04-15');
      
      const result = await webScraper.scrapeCourseContent(fromDate, toDate);
      
      // Generate embeddings for new content
      await aiService.generateEmbeddingsForContent();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sync failed" 
      });
    }
  });

  app.post("/api/data-sources/sync-discourse", async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.body;
      const fromDate = dateFrom ? new Date(dateFrom) : new Date('2025-01-01');
      const toDate = dateTo ? new Date(dateTo) : new Date('2025-04-14');
      
      const result = await webScraper.scrapeDiscourse(fromDate, toDate);
      
      // Generate embeddings for new content
      await aiService.generateEmbeddingsForContent();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sync failed" 
      });
    }
  });

  app.post("/api/data-sources/reindex-vectors", async (req, res) => {
    try {
      const result = await vectorDB.reindexEmbeddings();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Reindexing failed" 
      });
    }
  });

  // Configuration management
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getAllConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { key, value, description } = req.body;
      await storage.setConfig(key, value, description);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to save configuration" 
      });
    }
  });

  // Performance monitoring
  app.get("/api/performance/metrics", async (req, res) => {
    try {
      const metrics = await storage.getApiMetrics();
      const vectorStats = await vectorDB.getEmbeddingStats();
      
      // Mock additional performance metrics
      const performanceData = {
        ...metrics,
        latency: {
          avg: metrics.avgResponseTime,
          p95: metrics.avgResponseTime * 1.5,
          p99: metrics.avgResponseTime * 2,
        },
        throughput: Math.floor(metrics.questionsToday / 24), // questions per hour
        memory: {
          used: 2.1, // GB
          available: 8.0, // GB
          percentage: 26.25,
        },
        vectorDB: vectorStats,
      };
      
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  // Scraping jobs monitoring
  app.get("/api/scraping-jobs", async (req, res) => {
    try {
      const activeJobs = await storage.getActiveScrapingJobs();
      const recentJobs = await storage.getRecentScrapingJobs(20);
      
      res.json({
        active: activeJobs,
        recent: recentJobs,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scraping jobs" });
    }
  });

  // Test endpoint for API validation
  app.post("/api/test", async (req, res) => {
    try {
      const { question, image } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      // Mock response for testing
      const mockResponse = {
        answer: "This is a test response. In production, this would be generated by the AI service.",
        links: [
          {
            url: "https://discourse.onlinedegree.iitm.ac.in/t/test/123",
            text: "Test Discussion Thread"
          }
        ]
      };

      res.json(mockResponse);
    } catch (error) {
      res.status(500).json({ message: "Test endpoint failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
