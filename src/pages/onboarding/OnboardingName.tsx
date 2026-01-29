import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function OnboardingName() {
  const navigate = useNavigate();
  const { setUserData } = useApp();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();

  const handleContinue = () => {
    if (name.trim()) {
      setUserData({
        name: name.trim(),
        dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined,
        cycleLength: 28,
        periodLength: 5,
        pregnancyMode: false,
      });
      navigate('/onboarding/cycle-length');
    }
  };

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col animate-slide-up">
      <Header showBackButton backPath="/" />

      <div className="flex-1 flex flex-col px-6 py-4 max-w-sm mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-herflow-rose-light flex items-center justify-center mb-4">
          <User className="w-7 h-7 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-1">
          What should we call you?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          We'll use this to personalize your experience
        </p>

        {/* Form */}
        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 rounded-2xl bg-card border-border text-base px-4"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Date of birth <span className="text-muted-foreground">(optional)</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 rounded-2xl justify-start text-left font-normal bg-card border-border",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick your birthday</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1940-01-01")
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              We'll celebrate your birthday and provide age-appropriate insights
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full herflow-button-primary h-12 text-base mt-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
