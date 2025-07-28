'use client';

import React from 'react';
import LayoutPage from '@/components/ui/layoutpage';
import Link from 'next/link';

const PolitiqueConfidentialite: React.FC = () => {
  return (
    <LayoutPage title="Politique de Confidentialité" backHref="/">
      <div>
        {/* Introduction */}
        <section className="mb-12">
          <p className="mb-6">
            Chez Kaitos, la confidentialité de vos données est une priorité. Cette politique de confidentialité vise à vous informer 
            de manière claire sur la manière dont nous collectons, utilisons et protégeons vos données personnelles dans le cadre de 
            l'utilisation du site kaitos.agency.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Dernière mise à jour :</strong> 26 juillet 2025
          </p>
        </section>

        {/* Identité du responsable de traitement */}
        <section className="mb-12">
          <h2>1. Identité du responsable de traitement</h2>
          <div>
            <p>
              <strong>Entreprise :</strong> Yellowbird
            </p>
            <p>
              <strong>Dirigeant :</strong> Valentin Loriot
            </p>
            <p>
              <strong>Statut juridique :</strong> Micro-entreprise
            </p>
            <p>
              <strong>Adresse :</strong> 5 avenue Marx Dormoy, 18000 Bourges, France
            </p>
            <p>
              <strong>Email :</strong> contact@kaitos.agency
            </p>
          </div>
        </section>

        {/* Données collectées */}
        <section className="mb-12">
          <h2>2. Données collectées</h2>
          <div>
            <p className="mb-4">
              Nous collectons uniquement les données strictement nécessaires à nos finalités :
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Via le formulaire de contact :</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Nom (facultatif)</li>
                <li>Adresse e-mail</li>
                <li>Message libre</li>
                <li>Métadonnées techniques (adresse IP, date et heure, navigateur)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Via des outils tiers (Google Analytics, Vercel, etc.) :</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Données de navigation anonymisées (pages visitées, provenance, appareil utilisé, temps de visite)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Finalités du traitement */}
        <section className="mb-12">
          <h2>3. Finalités du traitement</h2>
          <div>
            <p className="mb-4">
              Les données personnelles sont traitées pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Répondre à vos demandes via le formulaire de contact</li>
              <li>Suivi statistique du trafic et amélioration du site</li>
              <li>Sécurité du site et prévention des abus techniques</li>
            </ul>
            <p className="mt-4">
              Aucune donnée n'est utilisée à des fins commerciales ou publicitaires sans votre consentement explicite.
            </p>
          </div>
        </section>

        {/* Hébergement et transfert de données */}
        <section className="mb-12">
          <h2>4. Hébergement et transfert de données</h2>
          <div>
            <p className="mb-4">
              Le site est hébergé par Vercel Inc., situé aux États-Unis. À ce titre, certaines données techniques 
              (ex. : adresse IP, logs serveur) peuvent transiter hors de l'Union Européenne.
            </p>
            <p className="mb-4">
              Vercel s'engage à respecter le RGPD via l'adoption de clauses contractuelles types (SCCs) validées par la Commission européenne.
            </p>
            <p>
              Pour en savoir plus : <a href="https://vercel.com/legal/privacy-policy">https://vercel.com/legal/privacy-policy</a>
            </p>
          </div>
        </section>

        {/* Durée de conservation */}
        <section className="mb-12">
          <h2>5. Durée de conservation</h2>
          <div>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Données de formulaire :</strong> 12 mois à compter du dernier contact</li>
              <li><strong>Logs serveur et analytics anonymisés :</strong> jusqu'à 13 mois maximum</li>
              <li><strong>Cookies :</strong> durée variable selon leur finalité (voir politique de cookies)</li>
            </ul>
          </div>
        </section>

        {/* Vos droits */}
        <section className="mb-12">
          <h2>6. Vos droits</h2>
          <div>
            <p className="mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Droit d'accès</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit d'opposition</li>
              <li>Droit à la portabilité</li>
              <li>Droit à la limitation du traitement</li>
            </ul>
            <p className="mb-4">
              Pour exercer vos droits, contactez-nous par e-mail à contact@kaitos.agency.
            </p>
            <p>
              Vous avez également le droit d'introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr">www.cnil.fr</a>
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2>7. Cookies</h2>
          <div>
            <p className="mb-4">
              Notre site utilise des cookies pour améliorer votre expérience de navigation et analyser le trafic du site.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Types de cookies utilisés :</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement du site (Vercel)</li>
                <li><strong>Cookies analytiques :</strong> Pour analyser le trafic et améliorer le site (Google Analytics)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Durée de conservation des cookies :</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants :</strong> Conservés jusqu'à 13 mois maximum</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Gestion des cookies :</h3>
              <p className="mb-2">
                En naviguant sur ce site, vous acceptez l'utilisation de cookies. Vous pouvez à tout moment :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Configurer votre navigateur pour refuser les cookies</li>
                <li>Supprimer les cookies existants via les paramètres de votre navigateur</li>
                <li>Utiliser le mode navigation privée pour limiter le stockage de cookies</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              <strong>Note :</strong> La désactivation de certains cookies peut affecter le fonctionnement du site.
            </p>
          </div>
        </section>

        {/* Sous-traitants */}
        <section className="mb-12">
          <h2>8. Sous-traitants</h2>
          <div>
            <p className="mb-4">
              Voici les services externes pouvant traiter des données techniques ou personnelles :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Vercel (hébergement)</li>
              <li>Google Analytics (statistiques anonymes)</li>
              <li>Formspree / autre service de formulaire (si applicable)</li>
            </ul>
          </div>
        </section>

        {/* Contact et liens */}
        <section className="border-t pt-8">
          <p className="mb-4">
            Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter à : contact@kaitos.agency
          </p>
          <p>
            Consultez également nos <Link href="/mentions-legales">Mentions Légales</Link>.
          </p>
        </section>
      </div>
    </LayoutPage>
  );
};

export default PolitiqueConfidentialite; 