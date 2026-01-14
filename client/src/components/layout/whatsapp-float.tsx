import { useLocation } from "wouter";
import { SiWhatsapp } from "react-icons/si";

export function WhatsAppFloat() {
  const [location] = useLocation();

  if (location.startsWith("/upwork-portfolio")) {
    return null;
  }

  return (
    <a
      href="https://wa.me/923224597697"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:scale-110 hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <SiWhatsapp className="w-8 h-8" />
    </a>
  );
}
