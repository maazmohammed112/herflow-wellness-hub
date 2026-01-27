import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { BarChart3, TrendingUp, Calendar, Droplets, Activity } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export function AnalysisScreen() {
  const { userData, periods, dailyLogs } = useApp();

  const insights = useMemo(() => {
    if (periods.length < 2) {
      return null;
    }

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    for (let i = 0; i < periods.length - 1; i++) {
      const currentStart = parseISO(periods[i].startDate);
      const previousStart = parseISO(periods[i + 1].startDate);
      const length = differenceInDays(currentStart, previousStart);
      if (length > 0 && length < 60) {
        cycleLengths.push(length);
      }
    }

    // Calculate period lengths
    const periodLengths = periods.map((p) => {
      return differenceInDays(parseISO(p.endDate), parseISO(p.startDate)) + 1;
    });

    const avgCycleLength = cycleLengths.length
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : userData?.cycleLength || 28;

    const avgPeriodLength = periodLengths.length
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : userData?.periodLength || 5;

    const cycleVariation = cycleLengths.length > 1
      ? Math.round(Math.max(...cycleLengths) - Math.min(...cycleLengths))
      : 0;

    const isRegular = cycleVariation <= 7;

    // Most common symptoms
    const symptomCounts: Record<string, number> = {};
    dailyLogs.forEach((log) => {
      log.symptoms?.forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return {
      avgCycleLength,
      avgPeriodLength,
      cycleVariation,
      isRegular,
      totalPeriods: periods.length,
      topSymptoms,
    };
  }, [periods, dailyLogs, userData]);

  return (
    <div className="min-h-screen herflow-gradient-bg pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Health Insights</h1>
        <p className="text-muted-foreground text-sm">
          Personalized analysis based on your data
        </p>
      </div>

      <div className="px-6 space-y-4">
        {insights ? (
          <>
            {/* Cycle Overview */}
            <div className="herflow-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-herflow-rose-light flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Cycle Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {insights.totalPeriods} logged periods
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Cycle</p>
                  <p className="text-2xl font-bold text-foreground">
                    {insights.avgCycleLength} <span className="text-sm font-normal">days</span>
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Period</p>
                  <p className="text-2xl font-bold text-foreground">
                    {insights.avgPeriodLength} <span className="text-sm font-normal">days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Regularity */}
            <div className="herflow-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-herflow-lavender-light flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Cycle Regularity</h3>
              </div>

              <div
                className={`rounded-2xl p-4 ${
                  insights.isRegular ? 'bg-herflow-mint' : 'bg-herflow-peach'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {insights.isRegular ? '✨' : '📊'}
                  </span>
                  <p className="font-semibold text-foreground">
                    {insights.isRegular ? 'Your cycle is regular!' : 'Some variation detected'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insights.isRegular
                    ? `Your cycles vary by only ${insights.cycleVariation} days, which is very consistent.`
                    : `Your cycles vary by ${insights.cycleVariation} days. This is common and usually normal.`}
                </p>
              </div>
            </div>

            {/* Common Symptoms */}
            {insights.topSymptoms.length > 0 && (
              <div className="herflow-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-herflow-blue-light flex items-center justify-center">
                    <Activity className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">Most Common Symptoms</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {insights.topSymptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="px-4 py-2 rounded-full bg-muted text-foreground text-sm capitalize"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Educational Tip */}
            <div className="herflow-card p-5 bg-herflow-cream">
              <h3 className="font-semibold text-foreground mb-2">💡 Did you know?</h3>
              <p className="text-sm text-muted-foreground">
                The average menstrual cycle is 28 days, but cycles between 21-35 days are
                considered normal. Tracking your cycle helps you understand your body's
                unique rhythm.
              </p>
            </div>
          </>
        ) : (
          <div className="herflow-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Not enough data yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Log at least 2 periods to see your personalized insights and cycle analysis.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
