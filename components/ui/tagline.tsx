interface TaglineProps {
  children: React.ReactNode;
  className?: string;
}

export function Tagline({ children, className = "" }: TaglineProps) {
  return (
    <span className={`inline-block bg-offwhite/20 text-xs px-4 py-1 font-offwhite rounded-full border border-offwhite/40 font-normal tracking-wide ${className}`}>
      {children}
    </span>
  );
} 