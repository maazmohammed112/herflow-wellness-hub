import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays } from 'lucide-react';
import { format, addDays } from 'date-fns';

export function OnboardingLastPeriod() {
  const navigate = useNavigate();
  const { userData, updateUserData, addPeriod, setOnboardingComplete } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const periodLength = userData?.periodLength || 5;

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Auto-calculate end date based on period length
      const calculatedEnd = addDays(date, periodLength - 1);
      setEndDate(calculatedEnd);
      if (periodLength > 6) {
        setShowEndDatePicker(true);
      }
    }
  };

  const handleDone = () => {
    if (selectedDate && endDate) {
      updateUserData({ lastPeriodStart: format(selectedDate, 'yyyy-MM-dd') });
      addPeriod({
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
      setOnboardingComplete(true);
      navigate('/calendar');
    }
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col px-6 py-12 animate-slide-up">
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-herflow-rose-light flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          When did your last period start?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Select the first day of your most recent period
        </p>

        {/* Calendar */}
        <div className="herflow-card p-4 mb-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date > new Date()}
            className="rounded-2xl pointer-events-auto"
          />
        </div>

        {/* Selected dates display */}
        {selectedDate && endDate && (
          <div className="herflow-card p-4 space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Start date</span>
              <span className="font-medium text-foreground">
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">End date</span>
              <span className="font-medium text-foreground">
                {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
            {showEndDatePicker && (
              <p className="text-xs text-muted-foreground">
                Tap the calendar again to adjust the end date if needed
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleDone}
            disabled={!selectedDate}
            className="w-full herflow-button-primary h-14 text-base"
          >
            Done
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
