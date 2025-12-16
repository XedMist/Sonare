import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

interface MediaSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: ReactNode;
  delay?: number;
}

export function MediaSection({
  title,
  subtitle,
  viewAllLink,
  children,
  delay = 0,
}: MediaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (headerRef.current) {
              animate(headerRef.current, {
                translateX: [-20, 0],
                opacity: [0, 1],
                duration: 600,
                delay: delay,
                ease: "outQuad",
              });
            }

            const cards = sectionRef.current?.querySelectorAll(".media-card");
            if (cards && cards.length > 0) {
              animate(cards, {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(60, { start: delay + 200 }),
                duration: 500,
                ease: "outQuad",
              });
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <section ref={sectionRef} className="mb-10">
      <div
        ref={headerRef}
        className="flex items-center justify-between mb-5 opacity-0"
      >
        <div>
          <h2 className="text-2xl font-bold text-surface-50">{title}</h2>
          {subtitle && (
            <p className="text-surface-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-sm font-medium text-surface-400 hover:text-surface-100 transition-colors group"
          >
            Ver todo
            <ChevronRight
              size={16}
              className="transform group-hover:translate-x-1 transition-transform"
            />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {children}
      </div>
    </section>
  );
}
