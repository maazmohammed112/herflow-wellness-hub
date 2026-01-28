import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';

export function OnboardingLastPeriod() {
  const navigate = useNavigate();
  const { userData, updateUserData, addPeriod, setOnboardingComplete } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const periodLength = userData?.periodLength || 5;
  const today = new Date();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const handleDateSelect = (date: Date) => {
    if (date > today) return;
    setSelectedDate(date);
    // Auto-calculate end date based on period length
    const calculatedEnd = addDays(date, periodLength - 1);
    setEndDate(calculatedEnd);
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

  const isInPeriodRange = (date: Date) => {
    if (!selectedDate || !endDate) return false;
    return date >= selectedDate && date <= endDate;
  };

  return (
    <div className="min-h-screen herflow-gradient-bg flex flex-col animate-slide-up">
      <Header showBackButton backPath="/onboarding/period-length" />

      <div className="flex-1 flex flex-col px-6 py-4 max-w-sm mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-herflow-rose-light flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-1">
          When did your last period start?
        </h1>
        <p className="text-muted-foreground text-sm mb-4">
          Select the first day of your most recent period
        </p>

        {/* Custom Calendar */}
        <div className="herflow-card p-4 mb-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-base font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              disabled={isSameMonth(currentMonth, today)}
            >
              <ChevronRight className={cn(
                'w-5 h-5',
                isSameMonth(currentMonth, today) ? 'text-muted' : 'text-muted-foreground'
              )} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isInRange = isInPeriodRange(day);
              const isFuture = day > today;

              return (
                <button
                  key={i}
                  onClick={() => handleDateSelect(day)}
                  disabled={isFuture || !isCurrentMonth}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all mx-auto',
                    !isCurrentMonth && 'opacity-0 pointer-events-none',
                    isFuture && 'opacity-30 cursor-not-allowed',
                    isSelected && 'bg-primary text-primary-foreground',
                    isInRange && !isSelected && 'bg-primary/30 text-foreground',
                    isToday && !isSelected && !isInRange && 'ring-2 ring-primary ring-offset-1',
                    !isSelected && !isInRange && !isFuture && isCurrentMonth && 'hover:bg-muted'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected dates display */}
        {selectedDate && endDate && (
          <div className="herflow-card p-4 space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Start date</span>
              <span className="font-medium text-foreground text-sm">
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">End date</span>
              <span className="font-medium text-foreground text-sm">
                {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">
              Based on your {periodLength}-day period length
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleDone}
            disabled={!selectedDate}
            className="w-full herflow-button-primary h-12 text-base"
          >
            Done
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full h-10 text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
