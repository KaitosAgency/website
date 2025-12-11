import Image from "next/image";
import { ReactNode } from "react";
import { Tagline } from "@/components/features/tagline";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";

interface HeroSectionProps {
  imageSrc: string;
  imageAlt: string;
  tagline?: string;
  title: string | ReactNode;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  showStars?: boolean;
  overlayIntensity?: "light" | "medium" | "strong";
  className?: string;
}

export function HeroSection({
  imageSrc,
  imageAlt,
  tagline,
  title,
  description,
  ctaText,
  ctaHref,
  ctaOnClick,
  showStars = true,
  overlayIntensity = "medium",
  className = "",
}: HeroSectionProps) {
  const overlayClasses = {
    light: {
      top: "from-secondary/20 from-20% via-transparent via-50%",
      bottom: "from-secondary/30 via-secondary/20 via-25%",
    },
    medium: {
      top: "from-secondary from-30% via-transparent via-55%",
      bottom: "from-secondary via-secondary via-30%",
    },
    strong: {
      top: "from-secondary from-40% via-secondary/50 via-60%",
      bottom: "from-secondary via-secondary via-40%",
    },
  };

  const overlay = overlayClasses[overlayIntensity];

  return (
    <section className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-secondary px-4 ${className}`}>
      {/* Image de fond */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover w-full h-full"
          priority
          quality={95}
          sizes="100vw"
        />
      </div>

      {/* Overlay dégradé secondary en haut - même couleur que la barre de menu */}
      <div className="absolute top-0 left-0 right-0 h-[160px] bg-gradient-to-b from-secondary via-secondary to-transparent z-5"></div>

      {/* Contenu Hero */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full h-full text-white text-center gap-6 px-4 pb-8 pt-48">
        {(showStars || tagline) && (
          <div className="flex flex-col items-center gap-2">
            {showStars && (
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <svg key={index} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-gold drop-shadow-sm">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            )}
            {tagline && <Tagline>{tagline}</Tagline>}
          </div>
        )}
        <h1 className="gradient-title text-[42px] md:text-7xl font-bold md:font-semibold drop-shadow-lg shadow-black whitespace-pre-line overflow-visible py-2">
          {title}
        </h1>
        <p className="max-w-xs md:max-w-2xl mx-auto drop-shadow-lg text-offwhite font-extralight px-2 text-base md:text-lg">
          {description}
        </p>
        {ctaText && (
          <div className="flex gap-4 justify-center mt-6">
            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-2"
              onClick={ctaOnClick}
            >
              {ctaText}
              <ArrowIcon size={18} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

