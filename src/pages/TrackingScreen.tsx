import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp, DailyLog } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { format, parseISO, addDays, isBefore, startOfMonth } from 'date-fns';
import {
  Droplets,
  Frown,
  Smile,
  Meh,
  Heart,
  GlassWater,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  CloudRain,
  Zap,
  Moon,
  Brain,
  X,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const symptoms = [
  { id: 'cramps', label: 'Cramps', icon: Zap },
  { id: 'headache', label: 'Headache', icon: Brain },
  { id: 'bloating', label: 'Bloating', icon: CloudRain },
  { id: 'fatigue', label: 'Fatigue', icon: Moon },
  { id: 'backache', label: 'Backache', icon: Zap },
  { id: 'nausea', label: 'Nausea', icon: Frown },
];

const moods = [
  { id: 'happy', label: 'Happy', icon: Smile },
  { id: 'calm', label: 'Calm', icon: Sparkles },
  { id: 'neutral', label: 'Neutral', icon: Meh },
  { id: 'sad', label: 'Sad', icon: Frown },
  { id: 'anxious', label: 'Anxious', icon: Heart },
  { id: 'irritated', label: 'Irritated', icon: Zap },
];

const flowIntensities = [
  { level: 1, label: 'Spotting' },
  { level: 2, label: 'Light' },
  { level: 3, label: 'Medium' },
  { level: 4, label: 'Heavy' },
];

export function TrackingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userData,
    getDailyLog,
    addOrUpdateDailyLog,
    addPeriod,
    periods,
    deletePeriod,
    dailyLogs,
  } = useApp();

  const initialDate = location.state?.selectedDate || format(new Date(), 'yyyy-MM-dd');
  const addPeriodMode = location.state?.addPeriod || false;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [log, setLog] = useState<DailyLog>({
    date: selectedDate,
    symptoms: [],
    moods: [],
    medicine: [],
    waterIntake: 0,
  });
  const [isPeriodStart, setIsPeriodStart] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState(2);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false);
  const [periodEndDate, setPeriodEndDate] = useState<string | null>(null);

  // Check if selected date is in a past month
  const isPastMonth = isBefore(parseISO(selectedDate), startOfMonth(new Date()));

  useEffect(() => {
    const existingLog = getDailyLog(selectedDate);
    if (existingLog) {
      setLog(existingLog);
      if (existingLog.flowIntensity) {
        setFlowIntensity(existingLog.flowIntensity);
        setIsPeriodStart(true);
      }
    } else {
      setLog({
        date: selectedDate,
        symptoms: [],
        moods: [],
        medicine: [],
        waterIntake: 0,
      });
      setIsPeriodStart(false);
    }

    // Set period end date if logging period
    const periodLength = userData?.periodLength || 5;
    setPeriodEndDate(format(addDays(parseISO(selectedDate), periodLength - 1), 'yyyy-MM-dd'));
  }, [selectedDate, getDailyLog, userData]);

  const toggleSymptom = (symptomId: string) => {
    setLog((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptomId)
        ? prev.symptoms.filter((s) => s !== symptomId)
        : [...(prev.symptoms || []), symptomId],
    }));
  };

  const toggleMood = (moodId: string) => {
    setLog((prev) => ({
      ...prev,
      moods: prev.moods?.includes(moodId)
        ? prev.moods.filter((m) => m !== moodId)
        : [...(prev.moods || []), moodId],
    }));
  };

  const handleWaterIntake = (delta: number) => {
    setLog((prev) => ({
      ...prev,
      waterIntake: Math.max(0, Math.min(12, (prev.waterIntake || 0) + delta)),
    }));
  };

  const handleSave = () => {
    const logToSave = { ...log, date: selectedDate };
    
    if (isPeriodStart) {
      logToSave.flowIntensity = flowIntensity;
      const endDate = periodEndDate || format(addDays(parseISO(selectedDate), (userData?.periodLength || 5) - 1), 'yyyy-MM-dd');
      addPeriod({
        startDate: selectedDate,
        endDate,
        flowIntensity,
      });
    }

    addOrUpdateDailyLog(logToSave);
    toast.success('Entry saved');
    navigate('/calendar');
  };

  const handleDeletePeriod = () => {
    const periodIndex = periods.findIndex((p) => p.startDate === selectedDate);
    if (periodIndex >= 0) {
      deletePeriod(periodIndex);
    }
    setIsPeriodStart(false);
    setShowDeleteConfirm(false);
    toast.success('Period entry deleted');
  };

  const handleDeleteNote = () => {
    setLog((prev) => ({ ...prev, notes: '' }));
    addOrUpdateDailyLog({ ...log, notes: '', date: selectedDate });
    setShowDeleteNoteConfirm(false);
    toast.success('Note removed');
  };

  const navigateDate = (delta: number) => {
    const newDate = format(addDays(parseISO(selectedDate), delta), 'yyyy-MM-dd');
    setSelectedDate(newDate);
  };

  const hasExistingNote = log.notes && log.notes.trim().length > 0;

  return (
    <div className="min-h-screen herflow-gradient-bg pb-24">
      <Header 
        title="Daily Log" 
        showBackButton 
        backPath="/calendar" 
      />

      {/* Date Navigation */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between herflow-card p-3">
          <button onClick={() => navigateDate(-1)} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </span>
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 rounded-full hover:bg-muted">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Period Toggle */}
        <div className="herflow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-herflow-rose-light flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Period</h3>
                <p className="text-xs text-muted-foreground">Log period start</p>
              </div>
            </div>
            <button
              onClick={() => setIsPeriodStart(!isPeriodStart)}
              className={cn(
                'w-14 h-8 rounded-full transition-all',
                isPeriodStart ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full bg-card shadow-sm transition-transform',
                  isPeriodStart ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {isPeriodStart && (
            <div className="space-y-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Flow intensity</p>
              <div className="flex gap-2">
                {flowIntensities.map((flow) => (
                  <button
                    key={flow.level}
                    onClick={() => setFlowIntensity(flow.level)}
                    className={cn(
                      'flex-1 p-3 rounded-xl text-center transition-all',
                      flowIntensity === flow.level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <div className="flex justify-center gap-0.5 mb-1">
                      {Array.from({ length: flow.level }).map((_, i) => (
                        <Droplets key={i} className="w-3 h-3" />
                      ))}
                    </div>
                    <span className="text-xs">{flow.label}</span>
                  </button>
                ))}
              </div>

              {/* Period end date for past months */}
              {isPastMonth && periodEndDate && (
                <div className="bg-muted rounded-xl p-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">Period range</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{format(parseISO(selectedDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">End:</span>
                    <span className="font-medium">{format(parseISO(periodEndDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}

              {periods.some((p) => p.startDate === selectedDate) && (
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete period entry
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Symptoms */}
        <div className="herflow-card p-4">
          <h3 className="font-medium text-foreground mb-3">Symptoms</h3>
          <div className="grid grid-cols-3 gap-2">
            {symptoms.map((symptom) => {
              const Icon = symptom.icon;
              const isSelected = log.symptoms?.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={cn(
                    'p-3 rounded-xl flex flex-col items-center gap-1 transition-all',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{symptom.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Moods */}
        <div className="herflow-card p-4">
          <h3 className="font-medium text-foreground mb-3">Mood</h3>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const isSelected = log.moods?.includes(mood.id);
              return (
                <button
                  key={mood.id}
                  onClick={() => toggleMood(mood.id)}
                  className={cn(
                    'p-3 rounded-xl flex flex-col items-center gap-1 transition-all',
                    isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Water Intake */}
        <div className="herflow-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-herflow-blue-light flex items-center justify-center">
                <GlassWater className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Water Intake</h3>
                <p className="text-xs text-muted-foreground">{log.waterIntake || 0} glasses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWaterIntake(-1)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-medium"
              >
                -
              </button>
              <span className="w-8 text-center font-medium text-foreground">{log.waterIntake || 0}</span>
              <button
                onClick={() => handleWaterIntake(1)}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="herflow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Notes</h3>
            {hasExistingNote && (
              <button
                onClick={() => setShowDeleteNoteConfirm(true)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <Textarea
            value={log.notes || ''}
            onChange={(e) => setLog((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes for this day..."
            className="min-h-[100px] rounded-xl bg-muted border-0 resize-none"
          />
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full herflow-button-primary h-12">
          <Check className="w-4 h-4 mr-2" />
          Save Entry
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Period Entry"
        description="Are you sure you want to delete this period entry? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeletePeriod}
        variant="destructive"
      />

      <ConfirmDialog
        open={showDeleteNoteConfirm}
        onOpenChange={setShowDeleteNoteConfirm}
        title="Remove Note"
        description="Are you sure you want to remove this note? This action cannot be undone."
        confirmText="Remove"
        onConfirm={handleDeleteNote}
        variant="destructive"
      />

      <BottomNav />
    </div>
  );
}
