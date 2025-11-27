"use client"

import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { HeroSection } from "@/components/features/hero-section";
import { ContentCard } from "@/components/features/content-card";
import { Section, SectionHeader } from "@/components/features/section";
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
        imageSrc="/images/Music.jpg"
        imageAlt="SoundCloud Label Manager - Outil de gestion pour labels musicaux"
        tagline={t("music.tagline")}
        title={t("music.title")}
        description={t("music.description")}
        ctaText={t("music.cta")}
        ctaOnClick={handleSoundCloudLogin}
        overlayIntensity="strong"
      />

      {/* Message d'erreur */}
      {error && (
        <Section variant="default">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              <p className="font-semibold mb-2">Erreur de connexion</p>
              <p className="text-sm mb-2">
                {error === 'not_authenticated' && 'Vous devez vous connecter pour accéder au dashboard.'}
                {error === 'no_code' && 'Aucun code d\'autorisation reçu.'}
                {error === 'invalid_state' && 'Erreur de sécurité lors de la connexion.'}
                {error === 'config_error' && 'Erreur de configuration du serveur.'}
                {error === 'token_exchange_failed' && 'Échec de l\'échange du token.'}
                {error === 'no_token' && 'Aucun token d\'accès reçu.'}
                {error === 'user_fetch_failed' && 'Impossible de récupérer les informations utilisateur.'}
                {error === 'server_error' && 'Erreur serveur. Veuillez réessayer.'}
                {!['not_authenticated', 'no_code', 'invalid_state', 'config_error', 'token_exchange_failed', 'no_token', 'user_fetch_failed', 'server_error'].includes(error) && `Erreur: ${error}`}
              </p>
              {searchParams.get('details') && (
                <p className="text-xs mt-2 opacity-75">
                  Détails: {searchParams.get('details')}
                </p>
              )}
              {searchParams.get('message') && (
                <p className="text-xs mt-2 opacity-75">
                  Message: {searchParams.get('message')}
                </p>
              )}
              {searchParams.get('status') && (
                <p className="text-xs mt-2 opacity-75">
                  Status HTTP: {searchParams.get('status')}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Section Présentation */}
      <Section variant="default">
        <SectionHeader
          title={t("music.sectionTitle")}
          description={t("music.sectionDescription")}
        />

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <ContentCard
            title={t("music.forLabels.title")}
            description={t("music.forLabels.description")}
            items={[
              t("music.forLabels.items.0"),
              t("music.forLabels.items.1"),
              t("music.forLabels.items.2"),
              t("music.forLabels.items.3"),
            ]}
          />

          <ContentCard
            title={t("music.forArtists.title")}
            description={t("music.forArtists.description")}
            items={[
              t("music.forArtists.items.0"),
              t("music.forArtists.items.1"),
              t("music.forArtists.items.2"),
              t("music.forArtists.items.3"),
            ]}
          />
        </div>
      </Section>

      {/* Section Fonctionnalités */}
      <Section variant="gradient" containerClassName="text-center">
        <SectionHeader
          title={t("music.features.title")}
          description={t("music.features.description")}
          className="mb-12"
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ContentCard
            variant="minimal"
            title={t("music.features.automation.title")}
            description={t("music.features.automation.description")}
            icon="⚙️"
          />

          <ContentCard
            variant="minimal"
            title={t("music.features.analytics.title")}
            description={t("music.features.analytics.description")}
            icon="📊"
          />

          <ContentCard
            variant="minimal"
            title={t("music.features.workflow.title")}
            description={t("music.features.workflow.description")}
            icon="📅"
          />

          <ContentCard
            variant="minimal"
            title={t("music.features.multiAccount.title")}
            description={t("music.features.multiAccount.description")}
            icon="🔗"
          />
        </div>
      </Section>

      {/* Section À propos */}
      <Section variant="default">
        <div className="max-w-4xl mx-auto">
          <div className="bg-secondary/60 backdrop-blur-sm border border-offwhite/10 rounded-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl text-offwhite mb-6 text-center break-words">
          {t("music.about.title")}
        </h2>
            <div className="space-y-4 text-offwhite/80 font-light leading-relaxed">
              <p>{t("music.about.paragraph1")}</p>
              <p>{t("music.about.paragraph2")}</p>
              <p className="pt-4 border-t border-offwhite/10">
                <strong className="text-offwhite font-semibold">{t("music.about.paragraph3").split(":")[0]}:</strong> {t("music.about.paragraph3").split(":")[1]}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Section CTA */}
      <Section variant="dark" containerClassName="text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl text-offwhite mb-6 break-words">
          {t("music.ctaSection.title")}
        </h2>
        <p className="text-offwhite/80 max-w-2xl mx-auto font-light mb-8 text-lg">
          {t("music.ctaSection.description")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="default" 
            size="lg" 
            className="bg-primary text-offwhite hover:bg-primary/90 flex items-center gap-1 shadow-lg"
            onClick={handleSoundCloudLogin}
          >
            {t("music.cta")}
            <ArrowIcon size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-offwhite/40 text-offwhite hover:bg-offwhite/20 hover:border-offwhite/60 flex items-center gap-1 bg-offwhite/5"
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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </main>
    }>
      <MusicPageContent />
    </Suspense>
  );
}
