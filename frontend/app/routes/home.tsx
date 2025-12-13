import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/Button";
import Dither from "~/components/Dither";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sonare - Tu Música Personal en Streaming" },
        { name: "description", content: "Descubre y disfruta tu música favorita con Sonare" },
    ];
}

// ============================================
// LOGO SONARE
// ============================================

interface SonareLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
    className?: string;
}

const logoSizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
    xl: { icon: 80, text: "text-4xl" },
};

const SonareLogo = ({ size = "md", showText = true, className = "" }: SonareLogoProps) => {
    const { icon, text } = logoSizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary-500/40 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Logo container */}
                <div
                    className="relative rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25"
                    style={{ width: icon, height: icon }}
                >
                    {/* Sound wave logo */}
                    <svg
                        viewBox="0 0 48 48"
                        fill="none"
                        className="text-white"
                        style={{ width: icon * 0.6, height: icon * 0.6 }}
                    >
                        {/* Central circle (represents the sound source) */}
                        <circle cx="24" cy="24" r="6" fill="currentColor" />

                        {/* Sound waves emanating outward */}
                        <path
                            d="M24 10C31.732 10 38 16.268 38 24C38 31.732 31.732 38 24 38"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.9"
                        />
                        <path
                            d="M24 4C35.046 4 44 12.954 44 24C44 35.046 35.046 44 24 44"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.5"
                        />
                        <path
                            d="M24 16C28.418 16 32 19.582 32 24C32 28.418 28.418 32 24 32"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.7"
                        />
                    </svg>
                </div>
            </div>

            {showText && (
                <span className={`font-bold text-surface-50 tracking-tight ${text}`}>
                    Sonare
                </span>
            )}
        </div>
    );
};

// ============================================
// ICONOS DE FEATURES
// ============================================

interface FeatureIconProps {
    children: React.ReactNode;
}

const FeatureIconWrapper = ({ children }: FeatureIconProps) => (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-primary-600/20 transition-all duration-300">
        {children}
    </div>
);

const MusicLibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-400">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const PlaylistIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-400">
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
    </svg>
);

const DiscoverIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary-400">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" />
    </svg>
);

const HeroWaveIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-white">
        {/* Central sound source */}
        <circle cx="32" cy="32" r="8" fill="currentColor" />

        {/* Animated-looking waves */}
        <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2.5" opacity="0.8" fill="none" />
        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" opacity="0.5" fill="none" />
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" opacity="0.3" fill="none" />
    </svg>
);

// ============================================
// COMPONENTE: Header
// ============================================

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-900/90 backdrop-blur-xl border-b border-surface-700/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="group">
                        <SonareLogo size="sm" />
                    </Link>

                    {/* Auth links */}
                    <nav className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-surface-300 hover:text-surface-50 font-medium transition-colors px-4 py-2"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link to="/register">
                            <Button className="bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/25">
                                Registrarse
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

// ============================================
// COMPONENTE: Hero Section
// ============================================

const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Dithering Background */}
            <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
                <Dither
                    waveColor={[0.5, 0.3, 0.7]}
                    disableAnimation={false}
                    enableMouseInteraction={true}
                    mouseRadius={0.8}
                    colorNum={4}
                    waveAmplitude={0.3}
                    waveFrequency={2.5}
                    waveSpeed={0.03}
                />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-900/70 via-surface-900/50 to-surface-900 z-[1]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/8 rounded-full blur-[150px] z-[1]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
                {/* Hero Logo */}
                <div className="mb-12 inline-flex">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500/40 rounded-3xl blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/40 p-5">
                            <HeroWaveIcon />
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface-50 mb-6 tracking-tight">
                    Tu música,{" "}
                    <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
                        en todas partes
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl text-surface-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Descubre millones de canciones, crea tus playlists perfectas y disfruta una experiencia de audio sin interrupciones en todos tus dispositivos.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto bg-primary-500 text-white hover:bg-primary-400 px-8 py-4 text-base font-semibold shadow-xl shadow-primary-500/30">
                            Comenzar gratis
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto border border-surface-600 bg-surface-800/50 text-surface-200 hover:bg-surface-700/80 hover:border-surface-500 px-8 py-4 text-base backdrop-blur-sm">
                            Ya tengo una cuenta
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                    <StatItem value="10M+" label="Canciones" />
                    <StatItem value="500K+" label="Artistas" />
                    <StatItem value="100K+" label="Usuarios" />
                </div>
            </div>
        </section>
    );
};

// ============================================
// COMPONENTE: Stat Item
// ============================================

interface StatItemProps {
    value: string;
    label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
    <div className="text-center">
        <div className="text-2xl sm:text-3xl font-bold text-surface-50">{value}</div>
        <div className="text-sm text-surface-500 mt-1">{label}</div>
    </div>
);

// ============================================
// COMPONENTE: Feature Card
// ============================================

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className="group relative p-8 rounded-2xl bg-surface-800/40 border border-surface-700/30 hover:border-primary-500/40 transition-all duration-300 hover:bg-surface-800/60 backdrop-blur-sm">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
            <FeatureIconWrapper>
                {icon}
            </FeatureIconWrapper>
            <h3 className="text-xl font-semibold text-surface-50 mb-3 mt-6">
                {title}
            </h3>
            <p className="text-surface-400 leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);

// ============================================
// COMPONENTE: Section Header
// ============================================

interface SectionHeaderProps {
    title: string;
    subtitle: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
    <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            {title}
        </h2>
        <p className="text-surface-400 max-w-2xl mx-auto text-lg">
            {subtitle}
        </p>
    </div>
);

// ============================================
// COMPONENTE: Features Section
// ============================================

const FeaturesSection = () => {
    const features = [
        {
            icon: <MusicLibraryIcon />,
            title: "Millones de canciones",
            description: "Accede a una biblioteca inmensa de música de artistas de todo el mundo, desde clásicos hasta los últimos lanzamientos."
        },
        {
            icon: <PlaylistIcon />,
            title: "Playlists personalizadas",
            description: "Crea y organiza tu música exactamente como la quieres. Comparte tus playlists con amigos y descubre las de otros."
        },
        {
            icon: <DiscoverIcon />,
            title: "Descubre música nueva",
            description: "Obtén recomendaciones personalizadas basadas en tus gustos y explora nuevos géneros y artistas."
        }
    ];

    return (
        <section className="relative py-28 bg-surface-900">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800/20 to-surface-900" />

            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-500/5 rounded-full blur-[100px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    title="Todo lo que necesitas"
                    subtitle="Una experiencia de música completa diseñada para amantes de la música"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================
// COMPONENTE: CTA Section
// ============================================

const CTASection = () => {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background dithering */}
            <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
                <Dither
                    waveColor={[0.5, 0.3, 0.7]}
                    disableAnimation={false}
                    enableMouseInteraction={true}
                    mouseRadius={0.5}
                    colorNum={3}
                    waveAmplitude={0.2}
                    waveFrequency={2}
                    waveSpeed={0.02}
                />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 via-surface-900/60 to-surface-900/80 z-[1]" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Mini logo */}
                <div className="mb-8 inline-flex">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-primary-400">
                            <circle cx="24" cy="24" r="6" fill="currentColor" />
                            <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" opacity="0.6" fill="none" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-50 mb-6">
                    ¿Listo para escuchar?
                </h2>
                <p className="text-lg text-surface-300 mb-10 max-w-xl mx-auto leading-relaxed">
                    Únete a miles de usuarios que ya disfrutan de su música favorita con Sonare. Es gratis para comenzar.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register">
                        <Button size="lg" className="bg-primary-500 text-white hover:bg-primary-400 px-10 py-4 text-base font-semibold shadow-xl shadow-primary-500/30">
                            Crear cuenta gratis
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="secondary" size="lg" className="border border-surface-600 bg-surface-800/50 text-surface-200 hover:bg-surface-700/80 px-8 py-4 backdrop-blur-sm">
                            Iniciar sesión
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

// ============================================
// COMPONENTE: Footer
// ============================================

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        className="text-surface-400 hover:text-primary-400 transition-colors duration-200"
    >
        {children}
    </a>
);

const Footer = () => {
    return (
        <footer className="py-16 border-t border-surface-800/50 bg-surface-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-8">
                    {/* Logo */}
                    <SonareLogo size="sm" />

                    {/* Links */}
                    <nav className="flex items-center gap-8 text-sm">
                        <FooterLink href="#">Privacidad</FooterLink>
                        <FooterLink href="#">Términos</FooterLink>
                        <FooterLink href="#">Contacto</FooterLink>
                        <FooterLink href="#">Soporte</FooterLink>
                    </nav>

                    {/* Divider */}
                    <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent" />

                    {/* Copyright */}
                    <p className="text-sm text-surface-500">
                        © 2025 Sonare. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function Home() {
    return (
        <div className="min-h-screen bg-surface-900">
            <Header />
            <main className="pt-16">
                <HeroSection />
                <FeaturesSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
