"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Dashboard } from "@/components/layout/dashboard";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useSoundCloud } from "@/lib/contexts/soundcloud-context";
import { useDashboardAuth } from "@/lib/hooks/use-dashboard-auth";
import { StatCardSkeleton, ProfileCardSkeleton } from "@/components/ui/skeleton";
import { PlatformProfileCard, PlatformProfileCardSkeleton } from "@/components/ui/platform-profile-card";
import { SoundCloudIcon } from "@/components/ui/icons/soundcloud-icon";

export default function MusicDashboard() {
  const { t } = useI18n();
  const {
    showSkeleton,
    error,
    isSoundCloudConnected,
    router,
  } = useDashboardAuth({ redirectUrl: '/music/dashboard' });

  const {
    tokenStatus,
    checkingToken,
    verifyToken,
    soundcloudUser,
    loadSoundCloudUser,
    automation,
    updateAutomation,
  } = useSoundCloud();

  const [automationLoading, setAutomationLoading] = useState(false);

  // Recharger les données SoundCloud si on revient du callback
  useEffect(() => {
    if (isSoundCloudConnected && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('soundcloud_connected')) {
        window.history.replaceState({}, '', '/music/dashboard');
        const reloadSoundCloud = async () => {
          try {
            await loadSoundCloudUser(true);
            setTimeout(() => {
              verifyToken(true, true);
            }, 500);
          } catch (err) {
            console.error('Erreur SoundCloud:', err);
            toast.error(t('dashboard.disconnectError'));
          }
        };
        reloadSoundCloud();
      }
    }
  }, [isSoundCloudConnected, verifyToken, loadSoundCloudUser, t]);

  const handleSoundCloudLogin = () => {
    router.push('/api/auth/soundcloud');
  };

  const handleAutomationToggle = async (checked: boolean) => {
    setAutomationLoading(true);
    try {
      await updateAutomation(checked);
      toast.success(checked ? t('dashboard.automationEnabled') : t('dashboard.automationDisabled'));
    } catch (err) {
      console.error(t('dashboard.disconnectError'), err);
      toast.error(t('dashboard.disconnectError'));
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleReauth = () => {
    router.push('/api/auth/soundcloud');
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/user/sign-out', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(t('dashboard.disconnectSuccess'));
        if (typeof window !== 'undefined') {
          localStorage.removeItem('soundcloud_token_status');
          localStorage.removeItem('soundcloud_user_data');
          localStorage.removeItem('soundcloud_config_data');
          localStorage.removeItem('soundcloud_automation');
        }
        await loadSoundCloudUser(true);
        await verifyToken(true, false);
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('dashboard.disconnectError'));
      }
    } catch (err) {
      console.error(t('dashboard.disconnectError'), err);
      toast.error(t('dashboard.disconnectError'));
    }
  };

  const handleSoundCloudSettings = () => {
    router.push('/music/dashboard/soundcloud');
  };

  // État de chargement
  if (showSkeleton) {
    return (
      <Dashboard title={t('dashboard.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlatformProfileCardSkeleton />
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard title={t('dashboard.title')}>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-xl mb-4">{t('dashboard.errorPrefix')} {error}</div>
          <Button onClick={() => router.push('/music')}>
            {t('dashboard.backToMusic')}
          </Button>
        </div>
      </Dashboard>
    );
  }

  // Construire la localisation
  const location = soundcloudUser ? [soundcloudUser.city, soundcloudUser.country]
    .filter(Boolean)
    .join(', ') : undefined;

  // Construire les stats
  const soundcloudStats = soundcloudUser ? [
    { label: t('dashboard.followers'), value: soundcloudUser.followers_count || 0 },
    { label: t('dashboard.following'), value: soundcloudUser.followings_count || 0 },
    { label: t('dashboard.tracks'), value: soundcloudUser.track_count || 0 },
    { label: t('dashboard.playlists'), value: soundcloudUser.playlist_count || 0 },
  ] : [];

  return (
    <Dashboard title={t('dashboard.title')}>
      {/* Message d'introduction quand pas de plateforme connectée */}
      {!isSoundCloudConnected && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-secondary mb-4">
            {t('dashboard.welcomeTitle')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('dashboard.welcomeDesc')}
          </p>
        </div>
      )}

      {/* Grille des plateformes connectées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SoundCloud Card */}
        {isSoundCloudConnected && soundcloudUser ? (
          <PlatformProfileCard
            platformName="SoundCloud"
            platformIcon={<SoundCloudIcon size={20} />}
            platformColor="#ff5500"
            username={soundcloudUser.username}
            displayName={soundcloudUser.full_name || soundcloudUser.username}
            avatarUrl={soundcloudUser.avatar_url}
            profileUrl={soundcloudUser.permalink_url}
            location={location}
            description={soundcloudUser.description}
            plan={soundcloudUser.plan}
            stats={soundcloudStats}
            isConnected={isSoundCloudConnected}
            isTokenValid={tokenStatus?.valid}
            isCheckingToken={checkingToken}
            tokenMessage={tokenStatus?.message}
            needsReauth={tokenStatus?.needsReauth}
            onVerifyToken={() => verifyToken(true, true)}
            onReauth={handleReauth}
            automationEnabled={automation || false}
            automationLoading={automationLoading}
            automationDisabled={!tokenStatus?.valid}
            onAutomationChange={handleAutomationToggle}
            automationLabel={t('dashboard.automation')}
            automationDescription={t('dashboard.automationDesc')}
            automationDisabledMessage={t('dashboard.tokenRequired')}
            onDisconnect={handleSignOut}
            onSettings={handleSoundCloudSettings}
            labels={{
              viewProfile: t('dashboard.viewProfile'),
              connectionStatus: t('dashboard.connectionStatus'),
              tokenValidation: t('dashboard.tokenValidation'),
              valid: t('dashboard.valid'),
              invalid: t('dashboard.invalid'),
              verify: t('dashboard.verify'),
              checking: t('dashboard.checking'),
              reauthenticate: t('dashboard.reauthenticate'),
              disconnect: t('dashboard.disconnect'),
              disconnectDesc: t('dashboard.disconnectDesc'),
              plan: t('dashboard.plan'),
              tokenValid: t('dashboard.tokenValid'),
              account: t('dashboard.account'),
              tokenRequired: t('dashboard.tokenRequired'),
            }}
          />
        ) : (
          /* Card pour connecter SoundCloud */
          <Card className="overflow-hidden w-full max-w-md">
            <div
              className="relative h-24"
              style={{
                background: 'linear-gradient(135deg, #ff5500 0%, #1a1a2e 100%)',
              }}
            >
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <SoundCloudIcon size={20} className="text-white/90" />
                <span className="text-white/90 text-sm font-medium">SoundCloud</span>
              </div>
            </div>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-secondary mb-2">
                {t('dashboard.connectSoundcloud')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('dashboard.connectSoundcloudDesc')}
              </p>
              <Button
                variant="default"
                onClick={handleSoundCloudLogin}
                className="flex items-center gap-2 mx-auto"
              >
                {t("music.cta")}
                <ArrowIcon size={16} />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Placeholder pour futures plateformes - Spotify */}
        <Card className="overflow-hidden w-full max-w-md opacity-60">
          <div
            className="relative h-24"
            style={{
              background: 'linear-gradient(135deg, #1DB954 0%, #1a1a2e 100%)',
            }}
          >
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span className="text-white/90 text-sm font-medium">Spotify</span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white/80">
              {t('common.comingSoon')}
            </div>
          </div>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">
              {t('dashboard.platformComingSoon')}
            </p>
          </CardContent>
        </Card>

        {/* Placeholder pour futures plateformes - YouTube */}
        <Card className="overflow-hidden w-full max-w-md opacity-60">
          <div
            className="relative h-24"
            style={{
              background: 'linear-gradient(135deg, #FF0000 0%, #1a1a2e 100%)',
            }}
          >
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/90" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-white/90 text-sm font-medium">YouTube</span>
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white/80">
              {t('common.comingSoon')}
            </div>
          </div>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">
              {t('dashboard.platformComingSoon')}
            </p>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}

