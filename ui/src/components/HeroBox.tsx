import { ReactNode } from "react";

interface HeroBoxProps {
  children: ReactNode;
  className?: string;
}

export function HeroBox({ children, className = "" }: HeroBoxProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 dark:from-primary-800 dark:via-primary-700 dark:to-primary-900 p-6 ${className}`}>
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)`,
        }}
      />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
