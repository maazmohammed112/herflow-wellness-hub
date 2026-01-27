import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";

// Pages
import { WelcomeScreen } from "@/pages/WelcomeScreen";
import { OnboardingName } from "@/pages/onboarding/OnboardingName";
import { OnboardingCycleLength } from "@/pages/onboarding/OnboardingCycleLength";
import { OnboardingPeriodLength } from "@/pages/onboarding/OnboardingPeriodLength";
import { OnboardingLastPeriod } from "@/pages/onboarding/OnboardingLastPeriod";
import { CalendarScreen } from "@/pages/CalendarScreen";
import { TrackingScreen } from "@/pages/TrackingScreen";
import { PregnancyScreen } from "@/pages/PregnancyScreen";
import { AnalysisScreen } from "@/pages/AnalysisScreen";
import { SettingsScreen } from "@/pages/SettingsScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { onboardingComplete } = useApp();

  return (
    <Routes>
      {/* Welcome & Onboarding */}
      <Route
        path="/"
        element={
          onboardingComplete ? <Navigate to="/calendar" replace /> : <WelcomeScreen />
        }
      />
      <Route path="/onboarding/name" element={<OnboardingName />} />
      <Route path="/onboarding/cycle-length" element={<OnboardingCycleLength />} />
      <Route path="/onboarding/period-length" element={<OnboardingPeriodLength />} />
      <Route path="/onboarding/last-period" element={<OnboardingLastPeriod />} />

      {/* Main App */}
      <Route
        path="/calendar"
        element={
          onboardingComplete ? <CalendarScreen /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/tracking"
        element={
          onboardingComplete ? <TrackingScreen /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/pregnancy"
        element={
          onboardingComplete ? <PregnancyScreen /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/analysis"
        element={
          onboardingComplete ? <AnalysisScreen /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/settings"
        element={
          onboardingComplete ? <SettingsScreen /> : <Navigate to="/" replace />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
