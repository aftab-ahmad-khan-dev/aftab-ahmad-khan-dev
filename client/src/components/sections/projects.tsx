import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "../ui/section-heading";
import { useProjects } from "@/hooks/use-projects";
import { ExternalLink, Loader2, Code2 } from "lucide-react";
import { Project } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Projects() {
  const { data: projects, isLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(projects?.map(p => p.category) || []))];

  const filteredProjects = filter === "All" 
    ? projects 
    : projects?.filter(p => p.category === filter);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section id="projects" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title="Featured Projects" 
          subtitle="A selection of my recent work and experiments"
        />

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === category
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-card border border-white/5 text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects?.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className="group relative bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full"
              >
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60" />
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-background/80 backdrop-blur text-xs font-bold rounded-full border border-white/10 text-primary">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                    {project.shortDescription}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-1 bg-white/5 rounded border border-white/5 text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-white/5 rounded border border-white/5 text-muted-foreground">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-sm font-medium transition-colors border border-white/10"
                    >
                      Details
                    </button>
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Project Details Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-white/10 text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display">{selectedProject?.title}</DialogTitle>
            <DialogDescription className="text-primary font-medium">{selectedProject?.category}</DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-8 mt-4">
              <div className="rounded-xl overflow-hidden aspect-video relative">
                 <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    The Problem
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedProject.problem}</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full" />
                    The Solution
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedProject.solution}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-4">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.techStack.map(tech => (
                    <div key={tech} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProject.liveLink && (
                <div className="pt-6 border-t border-white/10 flex justify-end">
                  <a 
                    href={selectedProject.liveLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
                  >
                    Visit Live Site <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
