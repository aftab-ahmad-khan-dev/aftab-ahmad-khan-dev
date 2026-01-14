import { motion } from "framer-motion";
import { SectionHeading } from "../ui/section-heading";
import { 
  SiReact, SiNextdotjs, SiNodedotjs, SiTypescript, 
  SiTailwindcss, SiPostgresql, SiN8N, SiOpenai,
  SiPython, SiDocker, SiGit, SiGraphql
} from "react-icons/si";

const techStack = [
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "n8n", icon: SiN8N, color: "#EA4B71" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "OpenAI API", icon: SiOpenai, color: "#412991" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "GraphQL", icon: SiGraphql, color: "#E10098" },
  { name: "Git", icon: SiGit, color: "#F05032" },
];

export function TechStack() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="tech" className="py-24 bg-card/20 relative">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title="My Tech Stack" 
          subtitle="Powerful tools I use to build robust applications"
        />

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
        >
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              variants={item}
              className="group flex flex-col items-center justify-center p-6 bg-background/40 backdrop-blur-sm border border-white/5 rounded-xl hover:border-primary/40 hover:bg-background/60 transition-all duration-300 hover:-translate-y-1"
            >
              <tech.icon 
                className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-white transition-colors duration-300"
                style={{ color: undefined }} // Let hover state handle color or use style logic
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
