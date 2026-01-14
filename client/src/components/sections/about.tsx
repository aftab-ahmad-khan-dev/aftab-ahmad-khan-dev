import { motion } from "framer-motion";
import { SectionHeading } from "../ui/section-heading";
import { CheckCircle2, Award, Zap, Code } from "lucide-react";

export function About() {
  const highlights = [
    { icon: Award, label: "100% Job Success Score" },
    { icon: Code, label: "Solo Full-Stack Dev" },
    { icon: Zap, label: "No Hand-offs" },
    { icon: CheckCircle2, label: "Vibe Coding Expert" },
  ];

  return (
    <section id="about" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title="About Me" 
          subtitle="Passionate about building software that matters"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl transform -rotate-3 transition-transform group-hover:rotate-0" />
            <div className="relative glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 font-display">Who am I?</h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I'm <strong className="text-primary">Aftab Ahmad Khan</strong>, a dedicated Solo Full-Stack Developer with a proven track record. I don't just write code; I own the entire development lifecycle.
                </p>
                <p>
                  With a <strong className="text-white">100% Job Success Score</strong> on freelance platforms, I pride myself on reliability and quality. There are no hand-offs here — I communicate directly with you, understand your vision, and execute it with precision.
                </p>
                <p>
                  Whether you need a complex SaaS platform, an AI-powered automation workflow, or a quick MVP, I deliver production-ready code. I also specialize in <em className="text-primary">"vibe coding"</em> — rapidly prototyping and iterating based on your specific aesthetic and functional preferences.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {highlights.map((item, index) => (
              <div 
                key={index}
                className="bg-card/30 border border-white/5 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 hover:bg-card/50 hover:border-primary/30 transition-all group"
              >
                <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <span className="font-semibold text-lg">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
