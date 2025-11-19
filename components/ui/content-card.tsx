import { ReactNode } from "react";

interface ContentCardProps {
  title: string;
  description: string;
  items?: string[];
  icon?: ReactNode | string;
  variant?: "default" | "minimal";
  className?: string;
}

export function ContentCard({
  title,
  description,
  items = [],
  icon,
  variant = "default",
  className = "",
}: ContentCardProps) {
  const baseClasses = variant === "default" 
    ? "bg-secondary/80 backdrop-blur-sm border border-offwhite/10 rounded-lg p-8"
    : "bg-offwhite/5 backdrop-blur-sm border border-offwhite/10 rounded-lg p-8";

  return (
    <div className={`${baseClasses} ${className}`}>
      {icon && (
        <div className="text-4xl mb-4">
          {typeof icon === "string" ? <span>{icon}</span> : icon}
        </div>
      )}
      <h3 className="text-2xl text-offwhite mb-4">
        {title}
      </h3>
      <p className="text-offwhite/80 font-light mb-6 leading-relaxed">
        {description}
      </p>
      {items.length > 0 && (
        <ul className="space-y-3 text-offwhite/80 font-light">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

