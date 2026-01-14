import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowRight, Download, MousePointerClick } from "lucide-react";
import { useLocation } from "wouter";

export function Hero() {
  const [location] = useLocation();
  const isUpwork = location.startsWith("/upwork-portfolio");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm">
            <span className="text-primary text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Available for work
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Hi, I'm <span className="text-gradient-primary">Aftab Ahmad Khan</span>
          </h1>

          <div className="text-xl md:text-3xl text-muted-foreground font-light mb-8 h-[60px] md:h-auto">
            <TypeAnimation
              sequence={[
                "Solo Full-Stack Developer",
                2000,
                "AI Agents & n8n Specialist",
                2000,
                "Backend & API Engineer",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-10 leading-relaxed">
            I build high-performance web applications and AI automations with modern stacks. 
            Transforming complex problems into elegant, scalable solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#projects"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              View My Work
              <ArrowRight className="w-5 h-5" />
            </a>
            
            {!isUpwork && (
              <a
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 bg-card/50 backdrop-blur-md text-foreground border border-white/10 font-semibold rounded-xl hover:bg-white/5 hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Contact Me
                <MousePointerClick className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 mx-auto" />
      </motion.div>
    </section>
  );
}
