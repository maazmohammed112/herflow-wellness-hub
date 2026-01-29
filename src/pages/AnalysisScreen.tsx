import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { BarChart3, TrendingUp, Calendar, Activity, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const educationalTips = [
  {
    title: "Understanding Your Menstrual Cycle",
    icon: "🩸",
    content: "Your menstrual cycle begins on the first day of your period and ends the day before your next period starts. The average cycle is 28 days, but anything between 21-35 days is considered normal. Tracking helps you understand your unique pattern."
  },
  {
    title: "The Fertile Window Explained",
    icon: "🌸",
    content: "Your fertile window is typically 6 days: the 5 days before ovulation and the day of ovulation itself. Sperm can survive up to 5 days in the reproductive tract, while an egg lives only 12-24 hours after release. This is when pregnancy is most likely."
  },
  {
    title: "Ovulation: What You Need to Know",
    icon: "✨",
    content: "Ovulation usually occurs 14 days before your next period. Signs include mild pelvic pain, increased cervical mucus (clear and stretchy like egg whites), a slight rise in basal body temperature, and increased libido. Some women may also notice breast tenderness."
  },
  {
    title: "PMS & Period Symptoms",
    icon: "💫",
    content: "Premenstrual syndrome (PMS) can start 1-2 weeks before your period. Common symptoms include bloating, mood swings, food cravings, fatigue, and breast tenderness. Regular exercise, reducing salt and caffeine, and getting enough sleep can help manage symptoms."
  },
  {
    title: "When to See a Doctor",
    icon: "🏥",
    content: "Consult a healthcare provider if you experience: periods lasting more than 7 days, cycles shorter than 21 days or longer than 35 days, extremely heavy bleeding, severe pain that affects daily activities, or missing three or more periods in a row."
  },
  {
    title: "Cycle & Overall Health",
    icon: "💪",
    content: "Your menstrual cycle can be an indicator of overall health. Stress, significant weight changes, excessive exercise, and certain medical conditions can affect your cycle. Tracking helps you notice patterns and communicate effectively with healthcare providers."
  }
];

export function AnalysisScreen() {
  const { userData, periods, dailyLogs } = useApp();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

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
      <Header title="Health Insights" />

      <div className="px-6 pt-4 space-y-4">
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

        {/* Educational Content Section */}
        <div className="herflow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-herflow-cream flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Learn About Your Cycle</h3>
              <p className="text-sm text-muted-foreground">Educational tips & info</p>
            </div>
          </div>

          <div className="space-y-2">
            {educationalTips.map((tip, index) => (
              <div
                key={index}
                className="bg-muted rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tip.icon}</span>
                    <span className="font-medium text-foreground text-sm">{tip.title}</span>
                  </div>
                  {expandedTip === index ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    expandedTip === index ? "max-h-96 pb-4" : "max-h-0"
                  )}
                >
                  <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
