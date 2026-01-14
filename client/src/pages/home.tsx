import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { TechStack } from "@/components/sections/tech-stack";
import { Projects } from "@/components/sections/projects";
import { Contact } from "@/components/sections/contact";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { useLocation } from "wouter";

export default function Home() {
  const [location] = useLocation();
  const isUpworkMode = location.startsWith("/upwork-portfolio");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {!isUpworkMode && <Header />}
      <main>
        <Hero />
        <About />
        <TechStack />
        <Projects />
        {!isUpworkMode && <Contact />}
      </main>
      {!isUpworkMode && <Footer />}
      {!isUpworkMode && <WhatsAppFloat />}
    </div>
  );
}
