import React from 'react';
import Link from 'next/link';

interface LayoutPageProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  backHref?: string;
}

const LayoutPage: React.FC<LayoutPageProps> = ({ children, className = '', title, backHref }) => {
  return (
    <div className={`min-h-screen bg-white mt-20 ${className}`}>
      {(title || backHref) && (
        <div>
          <div className="max-w-[1152px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              {backHref && (
                <Link href={backHref} className="text-primary hover:text-primary/80">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              )}
              {title && <h1 className="text-2xl font-bold text-secondary">{title}</h1>}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 py-12 text-secondary prose layout-page-prose
        prose-headings:!font-aileron
        prose-h2:!text-xl prose-h2:!font-bold
        prose-h3:!text-md prose-h3:!font-semibold
        prose-p:!text-base
      ">
        {children}
      </div>
    </div>
  );
};

export default LayoutPage; 