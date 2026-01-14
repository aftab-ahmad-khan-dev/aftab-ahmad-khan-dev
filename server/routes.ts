import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  // Seed data endpoint (internal use or auto-run)
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProjects();
  if (existing.length > 0) return;

  const sampleProjects = [
    {
      title: "AI-Powered SaaS Platform",
      shortDescription: "A generative AI platform for content creators.",
      problem: "Content creators struggle with consistent, high-quality output.",
      solution: "Built a RAG-based agent system using n8n and OpenAI to automate drafting.",
      feedback: "Aftab is a wizard! Automated 80% of our workflow.",
      techStack: ["Next.js", "n8n", "OpenAI", "PostgreSQL"],
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
      category: "AI Automation",
      isFeatured: true,
      liveLink: "#"
    },
    {
      title: "E-Commerce Dashboard",
      shortDescription: "Real-time analytics for a fashion retailer.",
      problem: "Client needed unified view of sales across 3 channels.",
      solution: "Developed a MERN stack dashboard with real-time webhooks.",
      feedback: "Best developer we've hired on Upwork. Fast and clean code.",
      techStack: ["React", "Node.js", "MongoDB", "Socket.io"],
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      category: "E-commerce",
      isFeatured: true,
      liveLink: "#"
    },
    {
      title: "Healthcare Appointment System",
      shortDescription: "HIPAA-compliant booking engine.",
      problem: "Old system was causing double bookings and patient frustration.",
      solution: "Rewrote the backend in Node.js with strict transaction locking.",
      feedback: "Professional, knowledgeable, and reliable.",
      techStack: ["Node.js", "PostgreSQL", "Docker", "AWS"],
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
      category: "Healthcare",
      isFeatured: false,
      liveLink: "#"
    },
    {
      title: "Fintech Wallet App",
      shortDescription: "Secure digital wallet for micro-transactions.",
      problem: "Need for speed and security in peer-to-peer transfers.",
      solution: "Implemented a secure ledger system with Next.js frontend.",
      feedback: "Excellent understanding of security principles.",
      techStack: ["Next.js", "TypeScript", "Prisma", "Stripe"],
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      category: "Fintech",
      isFeatured: true,
      liveLink: "#"
    }
  ];

  for (const p of sampleProjects) {
    await storage.createProject(p);
  }
}
