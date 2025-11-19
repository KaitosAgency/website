"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tagline } from "@/components/ui/tagline";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Navigation } from "@/components/ui/navigation";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { t } = useI18n();
  
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-secondary px-4">
      {/* Image de fond */}
      <div className="absolute inset-0 w-full h-full -top-[92px] md:-top-[72px]">
        <Image
          src="/images/HerobannerFull.jpg"
          alt="Bannière principale Kaitos"
          fill
          className="object-cover w-full h-full"
          priority
          quality={95}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
      {/* Overlay dégradé secondary */}
      <div className="absolute inset-0 h-[30%] bg-gradient-to-b from-secondary from-30% via-transparent via-55% to-transparent to-100% z-5"></div>
      {/* Overlay dégradé secondary en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-secondary via-secondary via-30% to-transparent to-100% z-5"></div>
      
      {/* Sélecteur de langues - Desktop seulement */}
      <div className="hidden md:flex gap-4 text-xs text-white/80 tracking-widest mt-3 absolute top-8 left-12 z-20">
        <LanguageSelector isDarkPage={true} />
      </div>
      
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
          <Tagline>{t("home.tagline")}</Tagline>
        </div>
        <h1 className="gradient-title text-[42px] md:text-7xl font-bold md:font-semibold drop-shadow-lg shadow-black whitespace-pre-line overflow-visible py-2">
          {t("home.title")}
        </h1>
        <p className="max-w-xs md:max-w-xl mx-auto drop-shadow text-offwhite font-extralight px-2">{t("home.description")}</p>
        <div className="flex gap-4 justify-center mt-6">
          <Button variant="default" size="lg" className="bg-offwhite text-secondary hover:bg-primary hover:text-offwhite flex items-center gap-1">
            {t("home.cta")}
            <ArrowIcon size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
