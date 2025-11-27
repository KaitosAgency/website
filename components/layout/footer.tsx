import Link from 'next/link';
import Image from 'next/image';
import { FaLinkedin, FaYoutube } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-secondarydark text-white">
      <div className="w-full px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start mb-8 md:mb-4">
              <Image
                src="/images/Logo/logo_kaitos_full_light.svg"
                alt="Kaitos Logo"
                width={100}
                height={30}
                className="h-7 w-auto"
              />
            </div>
            <p className="text-offwhite/80 mb-4 max-w-md text-sm mx-auto md:mx-0">
              L'agence IA Française n°1 pour accompagner votre entreprise vers la transition numérique et l'intelligence artificielle. 
              Nous transformons vos processus métier avec des solutions IA innovantes et sur mesure.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <Link href="#" className="transition-colors">
                <span className="sr-only">YouTube</span>
                <FaYoutube className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-md font-semibold mb-2">Services</h3>
            <ul className="space-y-1 text-offwhite/80">
              <li>
                <Link href="#" className="hover:text-offwhite transition-colors text-sm">
                  Agents téléphoniques
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-offwhite transition-colors text-sm">
                  E-commerce
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-offwhite transition-colors text-sm">
                  Édition de sites
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-offwhite transition-colors text-sm">
                  Référencement
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-offwhite transition-colors text-sm">
                  Projets sur mesure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-offwhite">Contact</h3>
            <ul className="space-y-1 text-offwhite/80">
              <li>
                <span className="block text-sm font-medium">Email</span>
                <Link href="mailto:contact@kaitos.fr" className="transition-colors">
                  contact@kaitos.fr
                </Link>
              </li>
              <li>
                <span className="block text-sm font-medium">Adresse</span>
                <span>Paris & Tokyo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-offwhite/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-offwhite/80">
            <p className="text-offwhite/80 text-sm">
              <b>© {new Date().getFullYear()} Kaitos.</b> Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/politique-confidentialite" className="text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/conditions-utilisation" className="text-sm transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/mentions-legales" className="text-sm transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 