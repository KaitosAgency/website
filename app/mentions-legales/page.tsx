'use client';

import React from 'react';
import LayoutPage from '@/components/ui/layoutpage';
import Link from 'next/link';

const MentionsLegales: React.FC = () => {
  return (
    <LayoutPage title="Mentions Légales" backHref="/">
      <div>
        {/* Introduction */}
        <section className="mb-12">
          <p className="mb-6">
            Conformément aux articles 6-III et 19 de la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), 
            il est porté à la connaissance des utilisateurs du site kaitos.agency les informations suivantes :
          </p>
        </section>

        {/* Éditeur */}
        <section className="mb-12">
          <h2>Éditeur du site</h2>
          <div>
            <p>
              <strong>Nom de l'entreprise :</strong> Yellowbird
            </p>
            <p>
              <strong>Statut juridique :</strong> Micro-entreprise
            </p>
            <p>
              <strong>Dirigeant :</strong> Valentin Loriot
            </p>
            <p>
              <strong>Adresse du siège :</strong> 5 avenue Marx Dormoy, 18000 Bourges, France
            </p>
            <p>
              <strong>SIRET :</strong> 848 793 253 00032
            </p>
            <p>
              <strong>Adresse e-mail :</strong> contact@kaitos.agency
            </p>
            <p>
              <strong>Directeur de la publication :</strong> Valentin Loriot
            </p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-12">
          <h2>Hébergement</h2>
          <div>
            <p>Le site est hébergé par :</p>
            <p>
              <strong>Vercel Inc.</strong>
            </p>
            <p>
              <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            </p>
            <p>
              <strong>Site web :</strong> <a href="https://vercel.com">https://vercel.com</a>
            </p>
            <p>
              <strong>Support :</strong> <a href="https://vercel.com/support">https://vercel.com/support</a>
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2>Propriété intellectuelle</h2>
          <div>
            <p>
              L'ensemble des éléments accessibles sur ce site (textes, images, graphismes, logo, vidéos, icônes, sons, logiciels, etc.) 
              reste la propriété exclusive de Yellowbird, sauf mention contraire.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite, 
              sauf autorisation écrite préalable.
            </p>
          </div>
        </section>

        {/* Limitation de responsabilité */}
        <section className="mb-12">
          <h2>Limitation de responsabilité</h2>
          <div>
            <p>
              Le site kaitos.agency est mis à jour régulièrement, mais peut contenir des inexactitudes ou des erreurs. 
              Yellowbird ne peut être tenu responsable des dommages directs ou indirects liés à l'utilisation du site ou aux liens externes.
            </p>
          </div>
        </section>

        {/* Données personnelles */}
        <section className="mb-12">
          <h2>Données personnelles</h2>
          <div>
            <p>
              La gestion des données personnelles collectées via ce site (formulaires, cookies...) est détaillée dans notre <Link href="/politique-confidentialite">Politique de confidentialité</Link>.
            </p>
            <p>
              Conformément au RGPD, vous disposez de droits d'accès, de rectification, d'effacement et d'opposition 
              que vous pouvez exercer par e-mail à contact@kaitos.agency.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2>Cookies</h2>
          <div>
            <p>
              Lors de votre navigation sur ce site, des cookies peuvent être installés dans votre navigateur. 
              Vous pouvez les accepter, les refuser ou les configurer via le bandeau prévu à cet effet.
            </p>
            <p>
              Plus d'informations sont disponibles dans notre <Link href="/politique-confidentialite">Politique de confidentialité</Link>.
            </p>
          </div>
        </section>

        {/* Dernière mise à jour */}
        <section className="border-t pt-8">
          <p>
            <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
          </p>
        </section>
      </div>
    </LayoutPage>
  );
};

export default MentionsLegales; 