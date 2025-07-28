'use client';

import React from 'react';
import LayoutPage from '@/components/ui/layoutpage';
import Link from 'next/link';

const ConditionsUtilisation: React.FC = () => {
  return (
    <LayoutPage title="Conditions d'Utilisation" backHref="/">
      <div>
        {/* Introduction */}
        <section className="mb-12">
          <p className="mb-6">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site kaitos.agency. 
            En accédant à ce site, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, 
            veuillez ne pas utiliser le site.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Dernière mise à jour :</strong> 26 juillet 2025
          </p>
        </section>

        {/* Informations légales */}
        <section className="mb-12">
          <h2>1. Informations légales</h2>
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Éditeur :</h3>
              <ul className="space-y-1">
                <li><strong>Entreprise :</strong> Yellowbird – Micro-entreprise</li>
                <li><strong>Dirigeant :</strong> Valentin Loriot</li>
                <li><strong>SIRET :</strong> 848 793 253 00032</li>
                <li><strong>Adresse :</strong> 5 avenue Marx Dormoy, 18000 Bourges</li>
                <li><strong>Email :</strong> contact@kaitos.agency</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Hébergeur :</h3>
              <ul className="space-y-1">
                <li><strong>Vercel Inc.</strong></li>
                <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
                <li><a href="https://vercel.com">https://vercel.com</a></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Accès au site */}
        <section className="mb-12">
          <h2>2. Accès au site</h2>
          <div>
            <p className="mb-4">
              Le Site est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Tous les frais 
              liés à l'accès au service (matériel, logiciel, connexion internet) sont à la charge de l'utilisateur.
            </p>
            <p>
              Yellowbird s'efforce d'assurer une accessibilité optimale du site, mais ne saurait être tenu responsable 
              d'éventuelles interruptions ou dysfonctionnements techniques.
            </p>
          </div>
        </section>

        {/* Services proposés */}
        <section className="mb-12">
          <h2>3. Services proposés</h2>
          <div>
            <p className="mb-4">
              Le Site a pour objet de présenter les activités de Kaitos, agence spécialisée dans l'accompagnement 
              des entreprises dans leur transition vers l'intelligence artificielle (audit, conseil, développement, 
              intégration de solutions IA).
            </p>
            <p className="mb-4">
              Le site peut proposer :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Des formulaires de contact</li>
              <li>Des démonstrations ou contenus informatifs</li>
              <li>Des liens vers des plateformes externes ou des outils de réservation (ex : Cal.com)</li>
            </ul>
            <p>
              Ces services sont fournis à titre informatif et peuvent évoluer sans préavis.
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2>4. Propriété intellectuelle</h2>
          <div>
            <p className="mb-4">
              Tous les éléments du site (textes, images, logos, illustrations, vidéos, graphismes, structure, code, etc.) 
              sont protégés par le Code de la propriété intellectuelle et sont la propriété exclusive de Yellowbird, 
              sauf mention contraire.
            </p>
            <p>
              Toute reproduction, représentation, adaptation ou exploitation partielle ou totale du contenu, par quelque 
              procédé que ce soit, est interdite sans autorisation préalable écrite.
            </p>
          </div>
        </section>

        {/* Données personnelles */}
        <section className="mb-12">
          <h2>5. Données personnelles</h2>
          <div>
            <p className="mb-4">
              L'utilisation du site peut entraîner la collecte de données personnelles (formulaire, cookies, etc.). 
              Pour en savoir plus, consultez notre <Link href="/politique-confidentialite">Politique de confidentialité</Link>.
            </p>
            <p>
              Conformément au RGPD, l'utilisateur dispose de droits sur ses données (accès, rectification, suppression…) 
              en écrivant à contact@kaitos.agency.
            </p>
          </div>
        </section>

        {/* Responsabilités */}
        <section className="mb-12">
          <h2>6. Responsabilités</h2>
          <div>
            <p className="mb-4">
              Yellowbird décline toute responsabilité :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>En cas d'erreur, d'inexactitude ou d'omission dans les contenus publiés</li>
              <li>En cas d'indisponibilité temporaire ou permanente du site</li>
              <li>Pour les conséquences de l'utilisation des informations fournies</li>
            </ul>
            <p>
              L'utilisateur s'engage à utiliser le site de manière conforme à la loi, à ne pas nuire au bon fonctionnement 
              du service, et à ne pas introduire de virus ou toute technologie malveillante.
            </p>
          </div>
        </section>

        {/* Liens externes */}
        <section className="mb-12">
          <h2>7. Liens externes</h2>
          <div>
            <p>
              Le Site peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif. 
              Yellowbird ne contrôle pas ces sites et décline toute responsabilité quant à leur contenu ou leurs 
              pratiques en matière de données personnelles.
            </p>
          </div>
        </section>

        {/* Modifications des CGU */}
        <section className="mb-12">
          <h2>8. Modifications des CGU</h2>
          <div>
            <p>
              Yellowbird se réserve le droit de modifier les présentes CGU à tout moment, sans préavis. 
              Les modifications entreront en vigueur dès leur publication sur le Site. Il appartient à l'utilisateur 
              de consulter régulièrement cette page.
            </p>
          </div>
        </section>

        {/* Droit applicable */}
        <section className="mb-12">
          <h2>9. Droit applicable</h2>
          <div>
            <p className="mb-4">
              Les présentes CGU sont régies par le droit français.
            </p>
            <p>
              En cas de litige, les parties s'efforceront de résoudre leur différend à l'amiable. À défaut, 
              les tribunaux compétents de Bourges (France) seront seuls compétents.
            </p>
          </div>
        </section>

        {/* Contact et liens */}
        <section className="border-t pt-8">
          <p className="mb-4">
            Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter à : contact@kaitos.agency
          </p>
          <p>
            Consultez également nos <Link href="/mentions-legales">Mentions Légales</Link> et notre <Link href="/politique-confidentialite">Politique de Confidentialité</Link>.
          </p>
        </section>
      </div>
    </LayoutPage>
  );
};

export default ConditionsUtilisation; 