import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/ui/tagline";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Navigation } from "@/components/ui/navigation";

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-secondary px-4">
      {/* Bannière Site en construction */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-primary z-20 flex items-center justify-center">
        <span className="text-white text-xs font-normal">Site en construction</span>
      </div>
      
      <Image
        src="/images/HerobannerFull.jpg"
        alt="Bannière principale Kaitos"
        fill
        className="object-cover object-[center_95%] w-full h-full"
        priority
        quality={100}
      />
      {/* Overlay dégradé secondary */}
      <div className="absolute inset-0 h-[70%] bg-gradient-to-b from-secondary from-5% via-transparent via-25% to-transparent to-100% z-5"></div>
      {/* Overlay dégradé secondary en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-secondary via-secondary via-30% to-transparent to-100% z-5"></div>
      <Navigation />
      {/* Overlay contenu Hero */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full h-full text-white text-center gap-4 pb-16">
        <div className="flex flex-col items-center gap-2">
          {/* 5 petites étoiles */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => (
              <svg key={index} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-gold drop-shadow-sm">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <Tagline>Le choix des pionniers</Tagline>
        </div>
        <h1 className="gradient-title text-4xl md:text-7xl font-bold md:font-semibold drop-shadow-lg shadow-black">Origine<br />de votre évolution</h1>
        <p className="text-sm max-w-xs md:max-w-xl mx-auto drop-shadow text-offwhite font-extralight px-2">Kaitos est l'agence IA Française qui accompagne les entreprises à intégrer l'intelligence artificielle comme un axe de transformation stratégique, avec méthode, suivi et vision long terme.</p>
        <div className="flex gap-4 justify-center mt-6">
          <Button variant="default" size="lg" className="bg-offwhite text-secondary hover:bg-primary hover:text-offwhite flex items-center gap-1">
            Commencer aujourd'hui
            <ArrowIcon size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
} 