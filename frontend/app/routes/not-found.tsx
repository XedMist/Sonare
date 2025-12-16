import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui";
import { HomeIcon, BackIcon, SearchIcon } from "../components/icons/Icons";
import Dither from "../components/Dither";

function SonareLogoMini() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary-500/40 rounded-xl blur-lg opacity-60" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25">
          <svg viewBox="0 0 48 48" fill="none" className="text-white w-7 h-7">
            <circle cx="24" cy="24" r="6" fill="currentColor" />
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
          </svg>
        </div>
      </div>
      <span className="text-xl font-bold text-surface-50 tracking-tight">
        Sonare
      </span>
    </div>
  );
}

function NotFoundIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto mb-8">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-surface-700/50 animate-pulse" />
      
      {/* Middle ring */}
      <div className="absolute inset-8 rounded-full border-2 border-surface-600/50" />
      
      {/* Inner ring with gradient */}
      <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/10 border border-primary-500/30" />
      
      {/* 404 Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl font-bold bg-gradient-to-br from-surface-200 to-surface-400 bg-clip-text text-transparent">
          404
        </span>
      </div>
      
      {/* Broken wave icons */}
      <svg className="absolute top-8 right-8 w-8 h-8 text-surface-600 rotate-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor" opacity="0.5" />
      </svg>
      <svg className="absolute bottom-12 left-8 w-6 h-6 text-surface-600 -rotate-12" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-surface-900 relative overflow-hidden">
      {/* Background dither effect */}
      <div className="absolute inset-0 opacity-30">
        <Dither
          waveColor={[77, 168, 218]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={200}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <SonareLogoMini />
        
        <NotFoundIllustration />
        
        <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-4 text-center">
          Page not found
        </h1>
        
        <p className="text-surface-400 text-center max-w-md mb-8">
          The page you're looking for doesn't exist or may have been moved. 
          Let's get you back to the music.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={handleGoBack} variant="secondary" className="gap-2">
            <BackIcon size={18} />
            Go Back
          </Button>
          
          <Link to="/">
            <Button className="gap-2">
              <HomeIcon size={18} />
              Go Home
            </Button>
          </Link>
          
          <Link to="/app/search">
            <Button variant="ghost" className="gap-2">
              <SearchIcon size={18} />
              Search Music
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
    </div>
  );
}
