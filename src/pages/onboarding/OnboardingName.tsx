import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { User } from 'lucide-react';

export function OnboardingName() {
  const navigate = useNavigate();
  const { setUserData } = useApp();
  const [name, setName] = useState('');
  const [yearOfBirth, setYearOfBirth] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      setUserData({
        name: name.trim(),
        yearOfBirth: yearOfBirth ? parseInt(yearOfBirth) : undefined,
        cycleLength: 28,
        periodLength: 5,
        pregnancyMode: false,
      });
      navigate('/onboarding/cycle-length');
    }
  };

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col px-6 py-12 animate-slide-up">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-herflow-rose-light flex items-center justify-center mb-6">
          <User className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          What should we call you?
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          We'll use this to personalize your experience
        </p>

        {/* Form */}
        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-14 rounded-2xl bg-card border-border text-base px-4"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Year of birth <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="number"
              value={yearOfBirth}
              onChange={(e) => setYearOfBirth(e.target.value)}
              placeholder="e.g., 1995"
              className="h-14 rounded-2xl bg-card border-border text-base px-4"
              min={1940}
              max={new Date().getFullYear() - 10}
            />
            <p className="text-xs text-muted-foreground">
              This helps us provide age-appropriate insights
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full herflow-button-primary h-14 text-base mt-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
