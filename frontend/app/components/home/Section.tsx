import { useRef, useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { animate } from "animejs";
import { ChevronRight } from "lucide-react";

interface SectionProps {
  title: string;
  viewAllLink?: string;
  children: ReactNode;
  delay?: number;
}

export function Section({ title, viewAllLink, children, delay = 0 }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      animate(sectionRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: delay,
        easing: "easeOutExpo",
        duration: 700,
      });
    }
  }, [delay]);

  return (
    <section ref={sectionRef} className="mb-10" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-surface-100">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium text-surface-400 hover:text-primary-400 transition-colors group"
          >
            Ver todo
            <ChevronRight 
              size={18} 
              className="group-hover:translate-x-1 transition-transform" 
            />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {children}
    </div>
  );
}
