import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    const date = new Date().toLocaleDateString("es-ES", options);
    return date.charAt(0).toUpperCase() + date.slice(1);
  };

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !subtitleRef.current) return;
    const tl = createTimeline({
      defaults: {
        ease: "outExpo",
      },
    });

    tl.add(textRef.current, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
    }).add(
      subtitleRef.current,
      {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
      },
      "-=500"
    );

    animate(".header-bar", {
      scaleX: [0, 1],
      opacity: [0, 1],
      delay: stagger(100, { start: 300 }),
      duration: 600,
      ease: "outQuad",
    });
  }, []);

  return (
    <div ref={containerRef} className="relative mb-8">
      {/* Barras decorativas animadas */}
      <div className="absolute -left-4 top-0 flex flex-col gap-1.5">
        <div className="header-bar h-1 w-8 bg-primary-500 rounded-full origin-left" />
        <div className="header-bar h-1 w-5 bg-primary-400/60 rounded-full origin-left" />
        <div className="header-bar h-1 w-3 bg-primary-300/40 rounded-full origin-left" />
      </div>

      <div className="pl-6">
        <h1
          ref={textRef}
          className="text-4xl sm:text-5xl font-bold text-surface-50 mb-2 opacity-0"
        >
          {getGreeting()}
          {userName && (
            <span className="text-primary-400">, {userName}</span>
          )}
        </h1>
        <p
          ref={subtitleRef}
          className="text-surface-400 text-lg opacity-0"
        >
          {getFormattedDate()} — ¿Qué te apetece escuchar hoy?
        </p>
      </div>
    </div>
  );
}
