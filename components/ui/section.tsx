import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  variant?: "default" | "dark" | "gradient";
  className?: string;
  containerClassName?: string;
}

export function Section({
  children,
  variant = "default",
  className = "",
  containerClassName = "",
}: SectionProps) {
  const variantClasses = {
    default: "bg-secondary",
    dark: "bg-secondarydark",
    gradient: "bg-gradient-to-b from-secondary to-secondarydark",
  };

  return (
    <section className={`relative w-full py-24 px-4 ${variantClasses[variant]} ${className}`}>
      <div className={`max-w-6xl mx-auto ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string | ReactNode;
  description?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h2 className="text-4xl md:text-5xl text-offwhite mb-4 break-words">
        {title}
      </h2>
      {description && (
        <p className="text-offwhite/80 max-w-2xl mx-auto font-light text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

