"use client"

import { useEffect, useState, KeyboardEvent, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/lib/contexts/auth-context";

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
  const router = useRouter();
  const {
    config,
    loadingConfig,
    loadConfig,
    updateConfig,
    soundcloudUser,
    initialLoadComplete,
  } = useSoundCloud();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const [savingStyles, setSavingStyles] = useState(false);
  const [savingMaxFollowings, setSavingMaxFollowings] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Vérifier l'authentification seulement une fois au montage initial
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth('/music/dashboard/soundcloud').then((isAuthenticated) => {
        if (!isAuthenticated) {
          setError('Non authentifié');
          setLoading(false);
        }
      });
    }
  }, [checkAuth]);

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

  // Vérifier si l'utilisateur est connecté à SoundCloud
  // Si soundcloudUser existe, cela signifie qu'il y a une connexion SoundCloud active
  const isSoundCloudConnected = soundcloudUser !== null && soundcloudUser !== undefined;

  // Attendre que le préchargement soit terminé
  useEffect(() => {
    if (initialLoadComplete && !authLoading && user) {
      setLoading(false);
    }
  }, [initialLoadComplete, authLoading, user]);

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
      setError(null);
      toast.success(`Style "${value}" ajouté`);
    } else if (styles.includes(value)) {
      toast.error(`Le style "${value}" est déjà ajouté`);
    } else if (styles.length >= 3) {
      toast.error('Maximum 3 styles atteint');
    }
  };

  const removeStyle = (index: number) => {
    setStyles(styles.filter((_, i) => i !== index));
  };

  const handleFollowUnfollowToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour activer cette fonctionnalité');
      return;
    }
    setFollowUnfollowLoading(true);
    try {
      const updatedConfig = await updateConfig({ follow_unfollow: checked });
      if (updatedConfig) {
        setFollowUnfollow(updatedConfig.follow_unfollow || false);
        toast.success(`Automation ${checked ? 'activée' : 'désactivée'}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour';
      console.error('Erreur lors de la mise à jour:', err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setFollowUnfollow(!checked);
    } finally {
      setFollowUnfollowLoading(false);
    }
  };

  const handleAutoRepostToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour activer cette fonctionnalité');
      return;
    }
    setAutoRepostLoading(true);
    try {
      const updatedConfig = await updateConfig({ auto_repost: checked });
      if (updatedConfig) {
        setAutoRepost(updatedConfig.auto_repost || false);
        toast.success(`Automation ${checked ? 'activée' : 'désactivée'}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour';
      console.error('Erreur lors de la mise à jour:', err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setAutoRepost(!checked);
    } finally {
      setAutoRepostLoading(false);
    }
  };

  const handleEngageWithArtistsToggle = async (checked: boolean) => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour activer cette fonctionnalité');
      return;
    }
    setEngageWithArtistsLoading(true);
    try {
      const updatedConfig = await updateConfig({ engage_with_artists: checked });
      if (updatedConfig) {
        setEngageWithArtists(updatedConfig.engage_with_artists || false);
        toast.success(`Automation ${checked ? 'activée' : 'désactivée'}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour';
      console.error('Erreur lors de la mise à jour:', err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setEngageWithArtists(!checked);
    } finally {
      setEngageWithArtistsLoading(false);
    }
  };

  const handleSaveStyles = async () => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour sauvegarder vos styles');
      return;
    }
    if (styles.length === 0) {
      setError('Veuillez renseigner au moins un style');
      toast.error('Veuillez renseigner au moins un style');
      return;
    }

    if (styles.length > 3) {
      setError('Vous ne pouvez pas renseigner plus de 3 styles');
      toast.error('Vous ne pouvez pas renseigner plus de 3 styles');
      return;
    }

    setSavingStyles(true);
    setError(null);

    try {
      const updatedConfig = await updateConfig({ styles });
      if (updatedConfig) {
        setStyles(updatedConfig.styles || []);
        setInputValue('');
        toast.success('Styles musicaux sauvegardés avec succès !');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la sauvegarde';
      console.error('Erreur lors de la sauvegarde:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingStyles(false);
    }
  };

  const handleAddComment = async () => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour ajouter un commentaire');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Veuillez entrer un commentaire');
      return;
    }

    if (comments.includes(newComment.trim())) {
      toast.error('Ce commentaire existe déjà');
      return;
    }

    const updatedComments = [...comments, newComment.trim()];
    await saveComments(updatedComments);
    setNewComment('');
  };

  const handleRemoveComment = async (comment: string) => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour supprimer un commentaire');
      return;
    }
    const updatedComments = comments.filter(c => c !== comment);
    await saveComments(updatedComments);
  };

  const saveComments = async (commentsToSave: string[]) => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour sauvegarder vos commentaires');
      return;
    }
    setSavingComments(true);
    try {
      const updatedConfig = await updateConfig({ comments: commentsToSave });
      if (updatedConfig) {
        setComments(updatedConfig.comments || []);
        toast.success('Commentaires sauvegardés avec succès');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la sauvegarde';
      console.error('Erreur lors de la sauvegarde:', err);
      toast.error(errorMessage);
    } finally {
      setSavingComments(false);
    }
  };

  const handleSaveMaxFollowings = async () => {
    if (!isSoundCloudConnected) {
      toast.error('Vous devez être connecté à SoundCloud pour sauvegarder la limite de suivi');
      return;
    }
    setSavingMaxFollowings(true);
    setError(null);

    try {
      const updatedConfig = await updateConfig({ max_followings: maxFollowings });
      if (updatedConfig) {
        setMaxFollowings(updatedConfig.max_followings || null);
        toast.success('Limite de suivi sauvegardée avec succès !');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la sauvegarde';
      console.error('Erreur lors de la sauvegarde:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingMaxFollowings(false);
    }
  };

  if (loading) {
    return (
      <Dashboard title="Configuration SoundCloud">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard title="Configuration SoundCloud">
      <div className="w-full">
        {!isSoundCloudConnected && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    ⚠️ Vous devez être connecté à SoundCloud pour configurer vos paramètres.
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Connectez-vous depuis la page Tableau de bord pour activer toutes les fonctionnalités.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/music/dashboard')}
                  variant="default"
                >
                  Aller au Tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne de gauche - Automations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  Automations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="follow-unfollow-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        Engagez avec une fan base qualifiée
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Engagez automatiquement avec des personnes qui écoutent des styles similaires au vôtre pour développer votre audience.
                    </p>
                  </div>
                  <Switch
                    id="follow-unfollow-toggle"
                    checked={followUnfollow}
                    onCheckedChange={handleFollowUnfollowToggle}
                    disabled={followUnfollowLoading || !isSoundCloudConnected}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-repost-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        Suivre la trend
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Découvrez et repartagez automatiquement les meilleures morceaux du moment qui correspondent à vos styles musicaux préférés.
                    </p>
                  </div>
                  <Switch
                    id="auto-repost-toggle"
                    checked={autoRepost}
                    onCheckedChange={handleAutoRepostToggle}
                    disabled={autoRepostLoading || !isSoundCloudConnected}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="engage-with-artists-toggle" className="text-base font-medium text-secondary cursor-pointer">
                        Connectez avec vos confrères
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600">
                      Établissez des connexions avec les artistes les plus prometteurs qui partagent vos goûts musicaux pour créer un réseau professionnel.
                    </p>
                  </div>
                  <Switch
                    id="engage-with-artists-toggle"
                    checked={engageWithArtists}
                    onCheckedChange={handleEngageWithArtistsToggle}
                    disabled={engageWithArtistsLoading || !isSoundCloudConnected}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card pour la gestion des commentaires */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  Mes commentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment-input" className="text-sm font-medium text-gray-700">
                    Ajouter un commentaire
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="comment-input"
                      type="text"
                      placeholder="Entrez un nouveau commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                      disabled={savingComments || !isSoundCloudConnected}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={savingComments || !newComment.trim() || !isSoundCloudConnected}
                    >
                      {savingComments ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Commentaires ({comments.length})
                    </Label>
                    {savingComments && (
                      <span className="text-xs text-gray-500">Sauvegarde...</span>
                    )}
                  </div>

                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun commentaire défini.</p>
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
                            aria-label={`Supprimer ${comment}`}
                            disabled={savingComments || !isSoundCloudConnected}
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
                  Styles musicaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="styles-input" className="text-base font-medium text-secondary mb-2 block">
                    Styles musicaux <span className="text-gray-500 font-normal">({styles.length}/3)</span>
                  </Label>
                  <Input
                    id="styles-input"
                    type="text"
                    placeholder="Ex: Electronic, Hip-Hop, Rock... (Appuyez sur Entrée ou tapez une virgule pour ajouter)"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    className="w-full"
                    disabled={styles.length >= 3 || !isSoundCloudConnected}
                  />
                  {styles.length >= 3 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 3 styles atteint
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
                          aria-label={`Supprimer ${style}`}
                          disabled={!isSoundCloudConnected}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> Renseignez les styles musicaux qui vous définissent pour toucher un maximum de monde.
                    Vous pouvez renseigner jusqu'à 3 styles différents. Appuyez sur Entrée ou tapez une virgule pour ajouter un style.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveStyles}
                    disabled={savingStyles || styles.length === 0 || styles.length > 3 || !isSoundCloudConnected}
                  >
                    {savingStyles ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card pour le nombre maximum de personnes à suivre */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  Limite de suivi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Affichage du nombre de followings actuel */}
                {currentFollowings !== null && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Nombre de personnes suivies actuellement :
                      </span>
                      <span className="text-lg font-semibold text-secondary">
                        {currentFollowings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="max-followings-input" className="text-base font-medium text-secondary mb-2 block">
                    Nombre maximum de personnes à suivre
                  </Label>
                  <Input
                    id="max-followings-input"
                    type="number"
                    min="0"
                    placeholder="Ex: 1000"
                    value={maxFollowings === null ? '' : maxFollowings}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMaxFollowings(value === '' ? null : parseInt(value, 10));
                    }}
                    className="w-full"
                    disabled={!isSoundCloudConnected}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Définissez le nombre maximum de personnes que vous souhaitez suivre. Votre compte sera synchronisé quotidiennement pour respecter cette limite.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-amber-800">
                      <strong>⚠️ Sécurité :</strong> Un maximum de 100 personnes par jour sera unfollow pour éviter les blocages.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="default"
                    onClick={handleSaveMaxFollowings}
                    disabled={savingMaxFollowings || !isSoundCloudConnected}
                  >
                    {savingMaxFollowings ? 'Sauvegarde...' : 'Sauvegarder'}
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

