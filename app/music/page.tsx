"use client"

import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { HeroSection } from "@/components/features/hero-section";
import { Section, SectionHeader } from "@/components/features/section";
import { Tagline } from "@/components/features/tagline";
import { useI18n } from "@/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function MusicPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleSoundCloudLogin = () => {
    router.push('/music/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* Section Hero */}
      <HeroSection
        imageSrc="/images/MusicHero.jpg"
        imageAlt="Kaitos Music - Gestion musicale"
        tagline={t("music.tagline")}
        title={t("music.title")}
        description={t("music.description")}
        ctaText={t("music.cta")}
        ctaOnClick={handleSoundCloudLogin}
        overlayIntensity="strong"
      />

      {/* Message d'erreur */}
      {error && (
        <Section variant="default" className="!py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
              <p className="font-semibold mb-1">Erreur de connexion</p>
              <p className="text-sm opacity-90">
                {error === 'not_authenticated' && 'Connectez-vous pour accéder au dashboard.'}
                {!['not_authenticated'].includes(error) && `Code erreur: ${error}`}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Section Fonctionnalités */}
      <Section variant="default">
        <SectionHeader
          title={t("music.features.title")}
          description={t("music.features.description")}
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Gestion Centralisée */}
          <div className="group relative bg-secondary/80 border border-offwhite/10 rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-offwhite mb-3">{t("music.features.centralization.title")}</h3>
              <p className="text-offwhite/70 font-light leading-relaxed">
                {t("music.features.centralization.description")}
              </p>
            </div>
          </div>

          {/* Ciblage Intelligent */}
          <div className="group relative bg-secondary/80 border border-offwhite/10 rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-offwhite mb-3">{t("music.features.targeting.title")}</h3>
              <p className="text-offwhite/70 font-light leading-relaxed">
                {t("music.features.targeting.description")}
              </p>
            </div>
          </div>

          {/* Automatisation */}
          <div className="group relative bg-secondary/80 border border-offwhite/10 rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-offwhite mb-3">{t("music.features.automation.title")}</h3>
              <p className="text-offwhite/70 font-light leading-relaxed">
                {t("music.features.automation.description")}
              </p>
            </div>
          </div>

          {/* Multi-Comptes */}
          <div className="group relative bg-secondary/80 border border-offwhite/10 rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-offwhite mb-3">{t("music.features.labels.title")}</h3>
              <p className="text-offwhite/70 font-light leading-relaxed">
                {t("music.features.labels.description")}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Section Plateformes */}
      <Section variant="gradient">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl text-offwhite mb-4">{t("music.platforms.title")}</h2>
          <p className="text-offwhite/70 font-light text-lg">{t("music.platforms.subtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
          {/* SoundCloud (Actif) */}
          <div className="flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff5500] to-[#ff7700] flex items-center justify-center shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.255-2.154c-.009-.06-.049-.1-.099-.1zm-.699.72c-.047 0-.086.04-.095.093l-.182 1.441.182 1.409c.009.053.048.093.095.093.046 0 .083-.04.092-.093l.2-1.409-.2-1.441c-.009-.053-.046-.093-.092-.093zm1.456-.615c-.056 0-.098.047-.106.103l-.215 2.049.215 2.002c.008.056.05.102.106.102.055 0 .097-.046.104-.102l.242-2.002-.242-2.049c-.007-.056-.049-.103-.104-.103zm.643-.463c-.062 0-.105.051-.111.108l-.194 2.517.194 2.463c.006.057.049.108.111.108.06 0 .103-.051.109-.108l.221-2.463-.221-2.517c-.006-.057-.049-.108-.109-.108zm.659-.428c-.068 0-.114.056-.119.113l-.175 2.948.175 2.893c.005.057.051.113.119.113.067 0 .111-.056.117-.113l.198-2.893-.198-2.948c-.006-.057-.05-.113-.117-.113zm.715-.369c-.074 0-.121.062-.125.123l-.154 3.32.154 3.263c.004.061.051.123.125.123.073 0 .118-.062.123-.123l.174-3.263-.174-3.32c-.005-.061-.05-.123-.123-.123zm.713-.291c-.08 0-.125.067-.129.128l-.134 3.614.134 3.553c.004.061.049.128.129.128.079 0 .123-.067.127-.128l.152-3.553-.152-3.614c-.004-.061-.048-.128-.127-.128zm.715-.194c-.086 0-.131.073-.134.134l-.114 3.812.114 3.749c.003.061.048.134.134.134.085 0 .129-.073.132-.134l.129-3.749-.129-3.812c-.003-.061-.047-.134-.132-.134zm.715-.093c-.092 0-.135.079-.137.139l-.094 3.908.094 3.844c.002.06.045.139.137.139.091 0 .133-.079.135-.139l.106-3.844-.106-3.908c-.002-.06-.044-.139-.135-.139zm.763.025c-.098 0-.142.084-.144.144l-.073 3.739.073 3.784c.002.06.046.144.144.144.097 0 .14-.084.142-.144l.082-3.784-.082-3.739c-.002-.06-.045-.144-.142-.144zm.714.108c-.103 0-.148.09-.149.149l-.053 3.576.053 3.594c.001.059.046.149.149.149s.145-.09.146-.149l.059-3.594-.059-3.576c-.001-.059-.043-.149-.146-.149zm.668.13c-.108 0-.151.095-.152.152l-.032 3.393.032 3.411c0 .057.044.152.152.152.107 0 .148-.095.149-.152l.036-3.411-.036-3.393c-.001-.057-.042-.152-.149-.152zm.667.138c-.113 0-.156.1-.157.157l-.012 3.202.012 3.221c0 .057.044.157.157.157.112 0 .153-.1.154-.157l.013-3.221-.013-3.202c-.001-.057-.042-.157-.154-.157zm.693.124c-.118 0-.161.105-.162.162l.009 3.035-.009 3.055c0 .057.044.162.162.162.117 0 .158-.105.159-.162l-.01-3.055.01-3.035c-.001-.057-.042-.162-.159-.162zm.762.061c-.124 0-.167.11-.168.167v2.908c0 .001 0 2.929.001 2.929 0 .057.044.167.167.167.122 0 .163-.11.164-.167l.001-2.929v-2.908c-.001-.057-.042-.167-.165-.167zm6.266 1.242c-.359 0-.704.058-1.027.166-.215-2.431-2.248-4.338-4.744-4.338-.614 0-1.199.127-1.736.346-.201.082-.255.166-.257.329v8.541c.002.171.138.313.309.328.016.001 7.439.002 7.455.002 1.385 0 2.507-1.119 2.507-2.499 0-1.38-1.122-2.499-2.507-2.499z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#ff5500]">
              {t("music.platforms.operational")}
            </span>
          </div>

          {/* Spotify */}
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-offwhite/50">
              {t("music.platforms.comingSoon")}
            </span>
          </div>

          {/* YouTube */}
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF0000] to-[#cc0000] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-offwhite/50">
              {t("music.platforms.comingSoon")}
            </span>
          </div>

          {/* TikTok */}
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-20 h-20 rounded-2xl bg-[#000000] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-offwhite/50">
              {t("music.platforms.comingSoon")}
            </span>
          </div>

          {/* Bandcamp */}
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#629aa9] to-[#1a9eb7] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 18.75l7.437-13.5h16.563l-7.437 13.5h-16.563z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-offwhite/50">
              {t("music.platforms.comingSoon")}
            </span>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-light text-offwhite">
              ✨ Distribution automatisée
            </span>
            <span className="text-sm text-offwhite/50">
              Publiez sur toutes les plateformes de streaming en un clic
            </span>
          </div>
        </div>
      </Section>

      {/* Section Pricing / Beta */}
      <section className="relative w-full py-24 px-4 overflow-hidden bg-gradient-to-b from-[#cc120d] via-[#cc120d] to-secondary">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block mb-4 px-4 py-1.5 bg-offwhite/10 rounded-full text-offwhite text-sm font-medium tracking-wide">
            Phase Beta
          </span>

          <h2 className="gradient-title text-5xl md:text-6xl font-bold mb-6">
            {t("music.pricing.title")}
          </h2>

          <p className="text-offwhite/70 font-light text-lg mb-12 max-w-2xl mx-auto">
            {t("music.pricing.description")}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-12 text-left">
            {(Array.isArray(t("music.pricing.list", { returnObjects: true }))
              ? t("music.pricing.list", { returnObjects: true })
              : []).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-offwhite/80 font-light">{item}</span>
                </div>
              ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="primaryOutline"
              size="lg"
              className="flex items-center gap-2"
              onClick={handleSoundCloudLogin}
            >
              {t("music.cta")}
              <ArrowIcon size={20} />
            </Button>
            <p className="text-sm text-offwhite/50">{t("music.ctaSub")}</p>
          </div>
        </div>
      </section>

      {/* Section CTA finale */}
      <Section variant="default" containerClassName="text-center">
        <h2 className="text-4xl md:text-5xl text-offwhite mb-6">
          {t("music.ctaSection.title")}
        </h2>
        <p className="text-offwhite/70 font-light text-lg max-w-2xl mx-auto mb-10">
          {t("music.ctaSection.description")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="flex items-center gap-2"
            onClick={handleSoundCloudLogin}
          >
            {t("music.cta")}
            <ArrowIcon size={18} />
          </Button>
          <Button
            variant="primaryOutline"
            size="lg"
            className="flex items-center gap-2"
          >
            {t("music.learnMore")}
            <ArrowIcon size={18} />
          </Button>
        </div>
      </Section>
    </main>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary">
        <div className="text-offwhite/60">Chargement...</div>
      </main>
    }>
      <MusicPageContent />
    </Suspense>
  );
}

