import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';

const REMINDER_KEY = 'herflow-onboarding-reminder-dismissed';
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function OnboardingReminder() {
  const { userData, periods } = useApp();
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);

  const isOnboardingIncomplete = !userData?.name || !periods.length;

  useEffect(() => {
    if (!isOnboardingIncomplete) {
      setShowReminder(false);
      return;
    }

    const lastDismissed = localStorage.getItem(REMINDER_KEY);
    if (lastDismissed) {
      const timeSinceDismissed = Date.now() - parseInt(lastDismissed, 10);
      if (timeSinceDismissed < REMINDER_INTERVAL) {
        setShowReminder(false);
        return;
      }
    }

    setShowReminder(true);
  }, [isOnboardingIncomplete]);

  const handleDismiss = () => {
    localStorage.setItem(REMINDER_KEY, Date.now().toString());
    setShowReminder(false);
  };

  const handleComplete = () => {
    navigate('/settings', { state: { showOnboardingSection: true } });
  };

  if (!showReminder) return null;

  return (
    <div className="mx-6 mb-4">
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground text-sm mb-1">
              Complete your setup
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Set up your cycle details for accurate predictions and insights.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium"
              >
                Complete now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-muted-foreground text-xs"
              >
                Remind me later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
