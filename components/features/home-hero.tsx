"use client"

import { HeroSection } from "@/components/features/hero-section";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { t } = useI18n();

  return (
    <HeroSection
      imageSrc="/images/HerobannerFull.jpg"
      imageAlt="Bannière principale Kaitos"
      tagline={t("home.tagline")}
      title={t("home.title")}
      description={t("home.description")}
      ctaText={t("home.cta")}
      showStars={true}
      showBottomGradient={true}
      bottomOffset={15}
    />
  );
}
