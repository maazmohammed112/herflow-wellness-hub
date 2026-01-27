import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Baby, Heart, Sparkles, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function PregnancyScreen() {
  const { userData, updateUserData, getOvulationDate, getFertileWindow } = useApp();

  const pregnancyMode = userData?.pregnancyMode || false;
  const ovulationDate = getOvulationDate();
  const fertileWindow = getFertileWindow();

  const togglePregnancyMode = () => {
    updateUserData({ pregnancyMode: !pregnancyMode });
  };

  return (
    <div className="min-h-screen herflow-gradient-bg pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Pregnancy Mode</h1>
        <p className="text-muted-foreground text-sm">
          Track your fertility for conception planning
        </p>
      </div>

      <div className="px-6 space-y-4">
        {/* Toggle Card */}
        <div className="herflow-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-herflow-peach flex items-center justify-center">
                <Baby className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pregnancy Mode</h3>
                <p className="text-sm text-muted-foreground">
                  {pregnancyMode ? 'Currently active' : 'Turn on to focus on fertility'}
                </p>
              </div>
            </div>
            <button
              onClick={togglePregnancyMode}
              className={cn(
                'w-14 h-8 rounded-full transition-all',
                pregnancyMode ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full bg-card shadow-sm transition-transform',
                  pregnancyMode ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {pregnancyMode && (
          <>
            {/* Fertility Status */}
            <div className="herflow-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-herflow-lavender-light flex items-center justify-center">
                  <Heart className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Fertility Status</h3>
              </div>

              {fertileWindow ? (
                <div className="space-y-4">
                  <div className="bg-herflow-lavender-light rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Fertile Window</p>
                    <p className="font-semibold text-foreground">
                      {format(fertileWindow.start, 'MMM d')} - {format(fertileWindow.end, 'MMM d')}
                    </p>
                  </div>

                  {ovulationDate && (
                    <div className="bg-herflow-blue-light rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-accent-foreground" />
                        <p className="text-sm text-muted-foreground">Ovulation Day</p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {format(ovulationDate, 'EEEE, MMMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {differenceInDays(ovulationDate, new Date()) > 0
                          ? `In ${differenceInDays(ovulationDate, new Date())} days`
                          : differenceInDays(ovulationDate, new Date()) === 0
                          ? 'Today!'
                          : `${Math.abs(differenceInDays(ovulationDate, new Date()))} days ago`}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Log your period to see fertility predictions
                </p>
              )}
            </div>

            {/* Tips Card */}
            <div className="herflow-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-herflow-mint flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Fertility Tips</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm text-foreground">
                    🌟 Your most fertile days are the 2-3 days before ovulation
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm text-foreground">
                    💧 Stay hydrated and maintain a healthy lifestyle
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm text-foreground">
                    📝 Track your symptoms for better predictions
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {!pregnancyMode && (
          <div className="herflow-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-herflow-peach/50 flex items-center justify-center mx-auto mb-4">
              <Baby className="w-10 h-10 text-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Planning to conceive?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Turn on Pregnancy Mode to focus on your fertility window and ovulation tracking
            </p>
            <Button onClick={togglePregnancyMode} className="herflow-button-primary">
              Enable Pregnancy Mode
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
