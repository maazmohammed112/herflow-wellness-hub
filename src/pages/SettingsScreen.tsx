import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp, Theme } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  User,
  Calendar,
  Droplets,
  Palette,
  Download,
  Upload,
  ChevronRight,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SettingsScreen() {
  const location = useLocation();
  const { userData, updateUserData, setUserData, theme, setTheme, backupData, restoreData, periods, setOnboardingComplete } = useApp();

  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Check if onboarding is incomplete
  const isOnboardingIncomplete = !userData?.name || !periods.length;
  const showOnboardingSection = location.state?.showOnboardingSection || isOnboardingIncomplete;

  const startEditing = (field: string, value: string | number | undefined) => {
    setEditingField(field);
    setTempValue(String(value || ''));
  };

  const saveEdit = () => {
    if (!editingField) return;

    switch (editingField) {
      case 'name':
        if (tempValue.trim()) {
          if (!userData) {
            setUserData({
              name: tempValue.trim(),
              cycleLength: 28,
              periodLength: 5,
              pregnancyMode: false,
            });
          } else {
            updateUserData({ name: tempValue.trim() });
          }
        }
        break;
      case 'yearOfBirth':
        const year = parseInt(tempValue);
        if (!isNaN(year) && year > 1940 && year < new Date().getFullYear()) {
          updateUserData({ yearOfBirth: year });
        }
        break;
      case 'cycleLength':
        const cycle = parseInt(tempValue);
        if (!isNaN(cycle) && cycle >= 21 && cycle <= 45) {
          updateUserData({ cycleLength: cycle });
        }
        break;
      case 'periodLength':
        const period = parseInt(tempValue);
        if (!isNaN(period) && period >= 2 && period <= 10) {
          updateUserData({ periodLength: period });
        }
        break;
    }

    setEditingField(null);
    toast.success('Settings saved');
  };

  const handleBackup = () => {
    const data = backupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `herflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowBackupConfirm(false);
    toast.success('Backup downloaded successfully');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPendingRestore(content);
        setShowRestoreConfirm(true);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestore = () => {
    if (pendingRestore) {
      const success = restoreData(pendingRestore);
      if (success) {
        toast.success('Data restored successfully');
      } else {
        toast.error('Failed to restore data. Invalid file format.');
      }
    }
    setShowRestoreConfirm(false);
    setPendingRestore(null);
  };

  const themes: { id: Theme; label: string; icon: typeof Sparkles }[] = [
    { id: 'modern', label: 'Modern', icon: Sparkles },
    { id: 'retro', label: 'Retro Pixel', icon: Palette },
  ];

  return (
    <div className="min-h-screen herflow-gradient-bg pb-24">
      <Header title="Settings" />

      <div className="px-6 pt-4 space-y-4">
        {/* Complete Setup Banner */}
        {showOnboardingSection && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm mb-1">
                  Complete your profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Fill in your details below for accurate cycle predictions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        <div className="herflow-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </h3>

          <div className="space-y-3">
            {/* Name */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Name</span>
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-8 w-32 text-sm rounded-lg"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1 text-primary">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing('name', userData?.name)}
                  className="flex items-center gap-1 text-foreground"
                >
                  <span className={cn('text-sm', !userData?.name && 'text-primary font-medium')}>
                    {userData?.name || 'Set your name'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Year of Birth */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Year of Birth</span>
              {editingField === 'yearOfBirth' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-8 w-24 text-sm rounded-lg"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1 text-primary">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing('yearOfBirth', userData?.yearOfBirth)}
                  className="flex items-center gap-1 text-foreground"
                >
                  <span className="text-sm">{userData?.yearOfBirth || 'Not set'}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cycle Settings */}
        <div className="herflow-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Cycle Settings
          </h3>

          <div className="space-y-3">
            {/* Cycle Length */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Cycle Length</span>
              {editingField === 'cycleLength' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-8 w-20 text-sm rounded-lg"
                    min={21}
                    max={45}
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                  <button onClick={saveEdit} className="p-1 text-primary">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing('cycleLength', userData?.cycleLength)}
                  className="flex items-center gap-1 text-foreground"
                >
                  <span className="text-sm">{userData?.cycleLength || 28} days</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Period Length */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Period Length</span>
              {editingField === 'periodLength' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-8 w-20 text-sm rounded-lg"
                    min={2}
                    max={10}
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                  <button onClick={saveEdit} className="p-1 text-primary">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing('periodLength', userData?.periodLength)}
                  className="flex items-center gap-1 text-foreground"
                >
                  <span className="text-sm">{userData?.periodLength || 5} days</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="herflow-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2',
                    theme === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted hover:border-primary/50'
                  )}
                >
                  <Icon className={cn('w-6 h-6', theme === t.id ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-sm font-medium', theme === t.id ? 'text-primary' : 'text-foreground')}>
                    {t.label}
                  </span>
                  {theme === t.id && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Management */}
        <div className="herflow-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Data & Privacy
          </h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowBackupConfirm(true)}
              className="w-full justify-start h-12 rounded-xl"
            >
              <Download className="w-4 h-4 mr-3" />
              Backup Data
            </Button>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start h-12 rounded-xl"
            >
              <Upload className="w-4 h-4 mr-3" />
              Restore Data
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">HerFlow v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your data is stored locally on your device
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showBackupConfirm}
        onOpenChange={setShowBackupConfirm}
        title="Backup Your Data"
        description="Your data will be downloaded as a JSON file. Keep this file safe to restore your data later."
        confirmText="Download Backup"
        onConfirm={handleBackup}
      />

      <ConfirmDialog
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
        title="Restore Data"
        description="This will replace all your current data with the data from the backup file. This action cannot be undone."
        confirmText="Restore"
        onConfirm={handleRestore}
        variant="destructive"
      />

      <BottomNav />
    </div>
  );
}
