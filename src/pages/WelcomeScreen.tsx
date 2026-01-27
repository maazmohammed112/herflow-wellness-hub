import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import welcomeIllustration from '@/assets/welcome-illustration.png';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Her<span className="text-primary">Flow</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personal cycle companion
          </p>
        </div>

        {/* Illustration */}
        <div className="relative w-64 h-64">
          <img
            src={welcomeIllustration}
            alt="Woman with calendar illustration"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            Welcome to HerFlow
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Track your cycle with ease and care. Get personalized insights and 
            stay in tune with your body's natural rhythm.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/onboarding/name')}
          className="w-full herflow-button-primary h-14 text-base"
        >
          Let's start – I'm a new member
        </Button>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          Your data stays private and secure on your device
        </p>
      </div>
    </div>
  );
}
