import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { OnboardingReminder } from '@/components/OnboardingReminder';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  differenceInDays,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Droplets, Heart, Sparkles } from 'lucide-react';

export function CalendarScreen() {
  const navigate = useNavigate();
  const {
    userData,
    periods,
    dailyLogs,
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
    getNextPeriodDate,
    getCycleDay,
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const nextPeriod = getNextPeriodDate();
  const cycleDay = getCycleDay(today);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get status message
  const getStatusMessage = () => {
    if (!periods.length) {
      return "Add your period to get started";
    }

    const lastPeriod = periods[0];
    const lastPeriodStart = parseISO(lastPeriod.startDate);

    if (nextPeriod) {
      const daysUntilNext = differenceInDays(nextPeriod, today);
      if (daysUntilNext < 0) {
        return `Your period is ${Math.abs(daysUntilNext)} days late`;
      } else if (daysUntilNext === 0) {
        return "Period expected today";
      } else if (daysUntilNext <= 3) {
        return `Period expected in ${daysUntilNext} days`;
      }
    }

    if (isPeriodDay(today)) {
      return "You're on your period";
    }

    if (isOvulationDay(today)) {
      return "Ovulation day!";
    }

    if (isFertileDay(today)) {
      return "Fertile window";
    }

    return cycleDay ? `Day ${cycleDay} of your cycle` : "Track your cycle";
  };

  const hasNote = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = dailyLogs.find((l) => l.date === dateStr);
    return log && (log.notes || log.symptoms?.length || log.moods?.length);
  };

  const handleDateClick = (date: Date) => {
    navigate('/tracking', { state: { selectedDate: format(date, 'yyyy-MM-dd') } });
  };

  return (
    <div className="min-h-screen herflow-gradient-bg pb-24">
      <Header />
      
      {/* Status Section */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Hi, {userData?.name || 'there'}! 💕
        </h2>
        <p className="text-primary font-medium">{getStatusMessage()}</p>
      </div>

      {/* Onboarding Reminder */}
      <OnboardingReminder />

      {/* Status Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="herflow-card p-3 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-herflow-rose-light flex items-center justify-center mb-2">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Cycle Day</span>
            <span className="text-lg font-bold text-foreground">{cycleDay || '-'}</span>
          </div>

          <div className="herflow-card p-3 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-herflow-lavender-light flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Period In</span>
            <span className="text-lg font-bold text-foreground">
              {nextPeriod ? `${Math.max(0, differenceInDays(nextPeriod, today))}d` : '-'}
            </span>
          </div>

          <div className="herflow-card p-3 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-herflow-blue-light flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Cycle</span>
            <span className="text-lg font-bold text-foreground">{userData?.cycleLength || 28}d</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-6">
        <div className="herflow-card p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isPeriod = isPeriodDay(day);
              const isFertile = isFertileDay(day);
              const isOvulation = isOvulationDay(day);
              const hasNotes = hasNote(day);

              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'calendar-day relative aspect-square flex items-center justify-center mx-auto',
                    !isCurrentMonth && 'opacity-30',
                    isToday && 'calendar-day-today',
                    isPeriod && 'calendar-day-period',
                    !isPeriod && isFertile && 'calendar-day-fertile',
                    !isPeriod && !isFertile && isOvulation && 'calendar-day-ovulation'
                  )}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {hasNotes && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-herflow-lavender" />
              <span className="text-xs text-muted-foreground">Fertile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-herflow-blue" />
              <span className="text-xs text-muted-foreground">Ovulation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Period Button */}
      <div className="px-6 mt-6">
        <Button
          onClick={() => navigate('/tracking', { state: { addPeriod: true } })}
          className="w-full herflow-button-primary h-12"
        >
          <Droplets className="w-4 h-4 mr-2" />
          Log Period
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
