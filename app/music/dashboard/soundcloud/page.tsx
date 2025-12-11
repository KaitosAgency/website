"use client"

import { useEffect, useState, KeyboardEvent } from "react";
import { Dashboard } from "@/components/layout/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useSoundCloud } from "@/lib/contexts/soundcloud-context";
import { useDashboardAuth } from "@/lib/hooks/use-dashboard-auth";
import { useI18n } from "@/lib/i18n";

interface SoundCloudConfig {
  id: string;
  user_id: string;
  styles: string[];
  max_followings: number | null;
  follow_unfollow: boolean;
  auto_repost: boolean;
  engage_with_artists: boolean;
  comments: string[] | null;
  created_at: string;
  updated_at: string;
}

export default function SoundCloudConfigPage() {
  const { t } = useI18n();
  const {
    showLoading,
    error,
    isSoundCloudConnected,
    router,
  } = useDashboardAuth({ redirectUrl: '/music/dashboard/soundcloud' });

  const {
    config,
    loadingConfig,
    loadConfig,
    updateConfig,
    soundcloudUser,
    automation,
  } = useSoundCloud();

  const [savingStyles, setSavingStyles] = useState(false);
  const [savingMaxFollowings, setSavingMaxFollowings] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [maxFollowings, setMaxFollowings] = useState<number | null>(null);
  const [followUnfollow, setFollowUnfollow] = useState<boolean>(false);
  const [followUnfollowLoading, setFollowUnfollowLoading] = useState(false);
  const [autoRepost, setAutoRepost] = useState<boolean>(false);
  const [autoRepostLoading, setAutoRepostLoading] = useState(false);
  const [engageWithArtists, setEngageWithArtists] = useState<boolean>(false);
  const [engageWithArtistsLoading, setEngageWithArtistsLoading] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [savingComments, setSavingComments] = useState(false);

  // Synchroniser les données du contexte avec les états locaux
  useEffect(() => {
    if (config) {
      setStyles(config.styles || []);
      setMaxFollowings(config.max_followings || null);
      setFollowUnfollow(config.follow_unfollow || false);
      setAutoRepost(config.auto_repost || false);
      setEngageWithArtists(config.engage_with_artists || false);
      if (config.comments && Array.isArray(config.comments)) {
        setComments(config.comments as string[]);
      } else {
        setComments([]);
      }
    }
  }, [config]);

  // Récupérer le nombre de followings depuis l'utilisateur SoundCloud
  const currentFollowings = soundcloudUser?.followings_count || null;

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addStyle();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Si l'utilisateur tape une virgule, ajouter le tag
    if (value.includes(',')) {
      const parts = value.split(',');
      const newStyle = parts[0].trim();
      if (newStyle && styles.length < 3) {
        addStyleFromValue(newStyle);
        setInputValue(parts.slice(1).join(',').trim());
      } else {
        setInputValue(value.replace(',', ''));
      }
    }
  };

  const addStyle = () => {
    if (inputValue.trim() && styles.length < 3) {
      addStyleFromValue(inputValue.trim());
      setInputValue('');
    }
  };

  const addStyleFromValue = (value: string) => {
    if (value && !styles.includes(value) && styles.length < 3) {
      setStyles([...styles, value]);
      setConfigError(null);
      toast.success(`${t('soundcloudPage.styleAdded')}: "${value}"`);
    } else if (styles.includes(value)) {
      toast.error(t('soundcloudPage.styleExists'));
    } else if (styles.length >= 3) {
      toast.error(t('soundcloudPage.maxStylesReached'));
    }
  };

  const removeStyle = (index: number) => {
    setStyles(styles.filter((_, i) => i !== index));
  };

  const handleFollowUnfollowToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnected'));
      return;
    }
    setFollowUnfollowLoading(true);
    try {
      const updatedConfig = await updateConfig({ follow_unfollow: checked });
      if (updatedConfig) {
        setFollowUnfollow(updatedConfig.follow_unfollow || false);
        toast.success(checked ? t('dashboard.automationEnabled') : t('dashboard.automationDisabled'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setFollowUnfollow(!checked);
    } finally {
      setFollowUnfollowLoading(false);
    }
  };

  const handleAutoRepostToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnected'));
      return;
    }
    setAutoRepostLoading(true);
    try {
      const updatedConfig = await updateConfig({ auto_repost: checked });
      if (updatedConfig) {
        setAutoRepost(updatedConfig.auto_repost || false);
        toast.success(checked ? t('dashboard.automationEnabled') : t('dashboard.automationDisabled'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setAutoRepost(!checked);
    } finally {
      setAutoRepostLoading(false);
    }
  };

  const handleEngageWithArtistsToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnected'));
      return;
    }
    setEngageWithArtistsLoading(true);
    try {
      const updatedConfig = await updateConfig({ engage_with_artists: checked });
      if (updatedConfig) {
        setEngageWithArtists(updatedConfig.engage_with_artists || false);
        toast.success(checked ? t('dashboard.automationEnabled') : t('dashboard.automationDisabled'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setEngageWithArtists(!checked);
    } finally {
      setEngageWithArtistsLoading(false);
    }
  };

  const handleSaveStyles = async () => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnectedStyles'));
      return;
    }
    if (styles.length === 0) {
      setConfigError(t('soundcloudPage.atLeastOneStyle'));
      toast.error(t('soundcloudPage.atLeastOneStyle'));
      return;
    }

    if (styles.length > 3) {
      setConfigError(t('soundcloudPage.maxThreeStyles'));
      toast.error(t('soundcloudPage.maxThreeStyles'));
      return;
    }

    setSavingStyles(true);
    setConfigError(null);

    try {
      const updatedConfig = await updateConfig({ styles });
      if (updatedConfig) {
        setStyles(updatedConfig.styles || []);
        setInputValue('');
        toast.success(t('soundcloudPage.stylesSaved'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      setConfigError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingStyles(false);
    }
  };

  const handleAddComment = async () => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnectedComments'));
      return;
    }
    if (!newComment.trim()) {
      toast.error(t('soundcloudPage.enterCommentError'));
      return;
    }

    if (comments.includes(newComment.trim())) {
      toast.error(t('soundcloudPage.commentExists'));
      return;
    }

    const updatedComments = [...comments, newComment.trim()];
    await saveComments(updatedComments);
    setNewComment('');
  };

  const handleRemoveComment = async (comment: string) => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnectedComments'));
      return;
    }
    const updatedComments = comments.filter(c => c !== comment);
    await saveComments(updatedComments);
  };

  const saveComments = async (commentsToSave: string[]) => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnectedComments'));
      return;
    }
    setSavingComments(true);
    try {
      const updatedConfig = await updateConfig({ comments: commentsToSave });
      if (updatedConfig) {
        setComments(updatedConfig.comments || []);
        toast.success(t('soundcloudPage.commentsSaved'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      toast.error(errorMessage);
    } finally {
      setSavingComments(false);
    }
  };

  const handleSaveMaxFollowings = async () => {
    if (!isSoundCloudConnected) {
      toast.error(t('soundcloudPage.mustBeConnectedFollowLimit'));
      return;
    }
    setSavingMaxFollowings(true);
    setConfigError(null);

    try {
      const updatedConfig = await updateConfig({ max_followings: maxFollowings });
      if (updatedConfig) {
        setMaxFollowings(updatedConfig.max_followings || null);
        toast.success(t('soundcloudPage.followLimitSaved'));
      }
    } catch (err: any) {
      const errorMessage = err.message || t('common.error');
      console.error(t('common.error'), err);
      setConfigError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingMaxFollowings(false);
    }
  };

  if (showLoading) {
    return (
      <Dashboard title={t('soundcloudPage.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">{t('soundcloudPage.loading')}</div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard title={t('soundcloudPage.title')}>
      <div className="w-full">
        {!isSoundCloudConnected && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {t('soundcloudPage.notConnectedWarning')}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {t('soundcloudPage.notConnectedDesc')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/music/dashboard')}
                className="mt-4"
              >
                {t('soundcloudPage.goToDashboard')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Warning Autopilot Disabled */}
        {isSoundCloudConnected && automation === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-amber-800 font-medium mb-2">
              ⚠️ {t('soundcloudPage.enableAutopilotFirst')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/music/dashboard')}
              className="bg-white hover:bg-amber-50 border-amber-300 text-amber-900"
            >
              {t('soundcloudPage.goToDashboard')}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne de gauche - Automations et Commentaires */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  {t('soundcloudPage.automations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="follow-unfollow-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        {t('soundcloudPage.engageQualifiedFanbase')}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('soundcloudPage.engageQualifiedFanbaseDesc')}
                    </p>
                  </div>
                  <Switch
                    id="follow-unfollow-toggle"
                    checked={followUnfollow}
                    onCheckedChange={handleFollowUnfollowToggle}
                    disabled={followUnfollowLoading || !isSoundCloudConnected || !automation}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-repost-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        {t('soundcloudPage.followTrend')}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('soundcloudPage.followTrendDesc')}
                    </p>
                  </div>
                  <Switch
                    id="auto-repost-toggle"
                    checked={autoRepost}
                    onCheckedChange={handleAutoRepostToggle}
                    disabled={autoRepostLoading || !isSoundCloudConnected || !automation}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="engage-with-artists-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        {t('soundcloudPage.connectWithPeers')}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('soundcloudPage.connectWithPeersDesc')}
                    </p>
                  </div>
                  <Switch
                    id="engage-with-artists-toggle"
                    checked={engageWithArtists}
                    onCheckedChange={handleEngageWithArtistsToggle}
                    disabled={engageWithArtistsLoading || !isSoundCloudConnected || !automation}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card pour la gestion des commentaires */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  {t('soundcloudPage.myComments')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment-input" className="text-sm font-medium text-gray-700">
                    {t('soundcloudPage.addComment')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="comment-input"
                      type="text"
                      placeholder={t('soundcloudPage.enterComment')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                      disabled={savingComments || !isSoundCloudConnected || !automation}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={savingComments || !newComment.trim() || !isSoundCloudConnected || !automation}
                    >
                      {savingComments ? t('soundcloudPage.adding') : t('soundcloudPage.add')}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">
                      {t('soundcloudPage.comments')} ({comments.length})
                    </Label>
                    {savingComments && (
                      <span className="text-xs text-gray-500">{t('soundcloudPage.saving')}</span>
                    )}
                  </div>

                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('soundcloudPage.noComments')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {comments.map((comment, index) => (
                        <Badge
                          key={index}
                          variant="default"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                        >
                          <span>{comment}</span>
                          <button
                            onClick={() => handleRemoveComment(comment)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            aria-label={`${t('soundcloudPage.remove')} ${comment}`}
                            disabled={savingComments || !isSoundCloudConnected || !automation}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Styles musicaux et Limite de suivi */}
          <div className="space-y-6">
            {/* Card pour les styles musicaux */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  {t('soundcloudPage.musicStyles')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="styles-input" className="text-base font-medium text-secondary mb-2 block">
                    {t('soundcloudPage.musicStyles')} <span className="text-gray-500 font-normal">({styles.length}/3)</span>
                  </Label>
                  <Input
                    id="styles-input"
                    type="text"
                    placeholder={t('soundcloudPage.stylesPlaceholder')}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="w-full"
                    disabled={styles.length >= 3 || !isSoundCloudConnected || !automation}
                  />
                  {styles.length >= 3 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('soundcloudPage.maxStylesReached')}
                    </p>
                  )}
                </div>

                {/* Tags des styles */}
                {styles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="flex items-center gap-1.5 px-3 py-1.5"
                      >
                        <span>{style}</span>
                        <button
                          onClick={() => removeStyle(index)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          aria-label={`${t('soundcloudPage.remove')} ${style}`}
                          disabled={!isSoundCloudConnected || !automation}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    {t('soundcloudPage.stylesTip')}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveStyles}
                    disabled={savingStyles || styles.length === 0 || styles.length > 3 || !isSoundCloudConnected || !automation}
                  >
                    {savingStyles ? t('soundcloudPage.saving') : t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card pour le nombre maximum de personnes à suivre */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  {t('soundcloudPage.followLimit')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Affichage du nombre de followings actuel */}
                {currentFollowings !== null && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {t('soundcloudPage.currentFollowing')}
                      </span>
                      <span className="text-lg font-semibold text-secondary">
                        {currentFollowings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="max-followings-input" className="text-base font-medium text-secondary mb-2 block">
                    {t('soundcloudPage.maxFollowing')}
                  </Label>
                  <Input
                    id="max-followings-input"
                    type="number"
                    min="0"
                    placeholder={t('soundcloudPage.maxFollowingPlaceholder')}
                    value={maxFollowings === null ? '' : maxFollowings}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMaxFollowings(value === '' ? null : parseInt(value, 10));
                    }}
                    className="w-full"
                    disabled={!isSoundCloudConnected || !automation}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('soundcloudPage.maxFollowingDesc')}
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-amber-800">
                      {t('soundcloudPage.securityWarning')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveMaxFollowings}
                    disabled={savingMaxFollowings || !isSoundCloudConnected || !automation}
                  >
                    {savingMaxFollowings ? t('soundcloudPage.saving') : t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </Dashboard>
  );
}

