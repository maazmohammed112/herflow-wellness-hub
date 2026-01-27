import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Droplets, Minus, Plus } from 'lucide-react';

export function OnboardingPeriodLength() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useApp();
  const [periodLength, setPeriodLength] = useState(userData?.periodLength || 5);

  const handleContinue = () => {
    updateUserData({ periodLength });
    navigate('/onboarding/last-period');
  };

  const handleSkip = () => {
    navigate('/onboarding/last-period');
  };

  const adjustPeriodLength = (delta: number) => {
    const newValue = Math.max(2, Math.min(10, periodLength + delta));
    setPeriodLength(newValue);
  };

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col px-6 py-12 animate-slide-up">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-herflow-blue-light flex items-center justify-center mb-6">
          <Droplets className="w-8 h-8 text-accent-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          How many days does your period usually last?
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Most periods last 3-7 days. This helps us predict your cycle accurately.
        </p>

        {/* Number Picker */}
        <div className="herflow-card p-8 flex flex-col items-center space-y-6 flex-1 justify-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => adjustPeriodLength(-1)}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus className="w-6 h-6 text-muted-foreground" />
            </button>

            <div className="text-center min-w-[120px]">
              <span className="text-6xl font-bold text-primary">{periodLength}</span>
              <p className="text-muted-foreground text-sm mt-2">days</p>
            </div>

            <button
              onClick={() => adjustPeriodLength(1)}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {[3, 4, 5, 6, 7].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodLength(days)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  periodLength === days
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mt-8">
          <Button
            onClick={handleContinue}
            className="w-full herflow-button-primary h-14 text-base"
          >
            Next
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full h-12 text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
