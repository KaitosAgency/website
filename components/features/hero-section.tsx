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
  showBottomGradient?: boolean;
  bottomOffset?: number; // Pourcentage depuis le bas (ex: 10 = 10%)
  className?: string;
  children?: ReactNode;
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
  showBottomGradient = true,
  bottomOffset = 5,
  className = "",
  children,
}: HeroSectionProps) {
  return (
    <section className={`relative w-full min-h-screen flex items-end overflow-hidden bg-secondary px-4 ${className}`}>
      {/* Image de fond */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover w-full h-full"
          priority
          quality={100}
          sizes="100vw"
          unoptimized
        />
      </div>

      {/* Overlay dégradé en haut - unifié pour toutes les pages */}
      <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-secondary from-30% via-secondary/50 via-60% to-transparent z-5" />

      {/* Overlay dégradé en bas - optionnel */}
      {showBottomGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-secondary via-secondary via-30% to-transparent z-5" />
      )}

      {/* Contenu Hero */}
      <div
        className="absolute left-0 right-0 z-10 flex flex-col items-center w-full text-white text-center gap-4 px-4"
        style={{ bottom: `${bottomOffset}%` }}
      >
        {(showStars || tagline) && (
          <div className="flex flex-col items-center gap-2 mb-[-10px]">
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
        {children}
      </div>
    </section>
  );
}
