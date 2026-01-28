import herflowLogo from '@/assets/herflow-logo.png';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
  rightContent?: React.ReactNode;
}

export function Header({ title, showBackButton, backPath, rightContent }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <img
              src={herflowLogo}
              alt="HerFlow"
              className="w-8 h-8 object-contain"
            />
          )}
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
