import { useLocation } from "wouter";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  const [location] = useLocation();

  if (location.startsWith("/upwork-portfolio")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-white/5 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-display font-bold text-xl mb-2">Aftab Ahmad Khan</h3>
            <p className="text-muted-foreground text-sm">Full-Stack Developer & AI Specialist</p>
          </div>

          <div className="flex gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-primary transition-colors hover:-translate-y-1 transform duration-200">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Aftab Ahmad Khan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
