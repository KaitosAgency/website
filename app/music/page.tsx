import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { HeroSection } from "@/components/ui/hero-section";
import { ContentCard } from "@/components/ui/content-card";
import { Section, SectionHeader } from "@/components/ui/section";

export default function MusicPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Section Hero */}
      <HeroSection
        imageSrc="/images/Music.jpg"
        imageAlt="Bannière catalogue beatmakers Kaitos"
        tagline="Catalogue de beatmakers professionnels"
        title={
          <>
            Le son qui vous<br />correspond à 100%
          </>
        }
        description="Découvrez notre catalogue de beatmakers professionnels et trouvez le producteur qui créera le son parfait pour votre projet. Techniques IA et artisanales combinées pour un résultat unique."
        ctaText="Rejoindre le catalogue"
        overlayIntensity="strong"
      />

      {/* Section Catalogue */}
      <Section variant="default">
        <SectionHeader
          title={
            <>
              Un catalogue de <span className="text-primary">beatmakers d'exception</span>
            </>
          }
          description="Nous mettons en relation les meilleurs producteurs avec les artistes qui cherchent le son parfait pour leur projet musical."
        />

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <ContentCard
            title="Pour les artistes"
            description="Accédez à un catalogue sélectionné de beatmakers professionnels. Trouvez le producteur qui comprend votre vision et créera le son qui vous correspond à 100%."
            items={[
              "Catalogue de producteurs vérifiés",
              "Recherche par style et ambiance",
              "Écoute de démos avant engagement",
            ]}
          />

          <ContentCard
            title="Pour les producteurs"
            description="Rejoignez notre catalogue et faites découvrir votre talent à des artistes en quête de collaboration. Augmentez votre visibilité et développez votre réseau professionnel."
            items={[
              "Visibilité accrue auprès des artistes",
              "Mise en avant de votre portfolio",
              "Opportunités de collaboration",
            ]}
          />
        </div>
      </Section>

      {/* Section Techniques */}
      <Section variant="gradient" containerClassName="text-center">
        <SectionHeader
          title={
            <>
              Techniques <span className="text-primary">IA et artisanales</span>
            </>
          }
          description="Nous combinons l'intelligence artificielle la plus avancée avec l'expertise artisanale de nos beatmakers pour créer le son qui vous correspond à 100%. Chaque production est unique, sur-mesure et pensée pour votre projet."
          className="mb-12"
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ContentCard
            variant="minimal"
            title="Techniques IA"
            description="Utilisation de l'intelligence artificielle pour analyser vos références, générer des idées créatives et optimiser la production musicale."
            icon="🤖"
          />

          <ContentCard
            variant="minimal"
            title="Expertise artisanale"
            description="Le savoir-faire et la créativité humaine de nos beatmakers pour donner vie à votre vision avec sensibilité et précision."
            icon="🎵"
          />
        </div>
      </Section>

      {/* Section CTA */}
      <Section variant="dark" containerClassName="text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-offwhite mb-6">
          Prêt à rejoindre notre catalogue ?
        </h2>
        <p className="text-offwhite/80 max-w-2xl mx-auto font-light mb-8 text-lg">
          Inscrivez-vous dès maintenant pour apparaître sur notre catalogue de producteurs et connectez-vous avec des artistes en quête de votre talent.
        </p>
        <Button 
          variant="default" 
          size="lg" 
          className="bg-primary text-offwhite hover:bg-primary/90 flex items-center gap-1 mx-auto shadow-lg"
        >
          S'inscrire maintenant
          <ArrowIcon size={18} />
        </Button>
      </Section>
    </main>
  );
}
