"use client"

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dashboard } from "@/components/layout/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface SoundCloudConfig {
  id: string;
  user_id: string;
  styles: string[];
  max_followings: number | null;
  follow_unfollow: boolean;
  created_at: string;
  updated_at: string;
}

export default function SoundCloudConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingStyles, setSavingStyles] = useState(false);
  const [savingMaxFollowings, setSavingMaxFollowings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [maxFollowings, setMaxFollowings] = useState<number | null>(null);
  const [currentFollowings, setCurrentFollowings] = useState<number | null>(null);
  const [followUnfollow, setFollowUnfollow] = useState<boolean>(false);
  const [followUnfollowLoading, setFollowUnfollowLoading] = useState(false);
  const [config, setConfig] = useState<SoundCloudConfig | null>(null);

  useEffect(() => {
    checkAuthAndLoadConfig();
  }, []);

  const checkAuthAndLoadConfig = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login?redirect=/music/dashboard/soundcloud');
        return;
      }

      await Promise.all([loadConfig(), loadSoundCloudData()]);
    } catch (err) {
      setError('Erreur de vérification de l\'authentification');
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/user/soundcloud/config');
      if (response.ok) {
        const data = await response.json();
      if (data.config) {
        setConfig(data.config);
        // Remplir les styles existants
        const existingStyles = data.config.styles || [];
        setStyles(existingStyles);
        // Remplir max_followings
        setMaxFollowings(data.config.max_followings || null);
        // Remplir follow_unfollow
        setFollowUnfollow(data.config.follow_unfollow || false);
      }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
      toast.error('Erreur lors du chargement de la configuration');
    }
  };

  const loadSoundCloudData = async () => {
    try {
      const response = await fetch('/api/auth/soundcloud/user');
      if (response.ok) {
        const userData = await response.json();
        // Récupérer le nombre de followings actuel
        if (userData.followings_count !== undefined) {
          setCurrentFollowings(userData.followings_count);
        }
      }
    } catch (err) {
      // Ne pas afficher d'erreur si l'utilisateur n'est pas connecté à SoundCloud
      console.error('Erreur lors du chargement des données SoundCloud:', err);
    } finally {
      setLoading(false);
    }
  };

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
    setFollowUnfollowLoading(true);
    try {
      const response = await fetch('/api/user/soundcloud/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ follow_unfollow: checked }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowUnfollow(data.config.follow_unfollow || false);
        toast.success(`Automation ${checked ? 'activée' : 'désactivée'}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erreur lors de la mise à jour';
        toast.error(errorMessage);
        // Revenir à l'état précédent en cas d'erreur
        setFollowUnfollow(!checked);
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

  const handleSaveStyles = async () => {
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
      const response = await fetch('/api/user/soundcloud/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ styles }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        // Mettre à jour les styles affichés
        const savedStyles = data.config.styles || [];
        setStyles(savedStyles);
        setInputValue('');
        toast.success('Styles musicaux sauvegardés avec succès !');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erreur lors de la sauvegarde';
        setError(errorMessage);
        toast.error(errorMessage);
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

  const handleSaveMaxFollowings = async () => {
    setSavingMaxFollowings(true);
    setError(null);

    try {
      const response = await fetch('/api/user/soundcloud/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ max_followings: maxFollowings }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setMaxFollowings(data.config.max_followings || null);
        toast.success('Limite de suivi sauvegardée avec succès !');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erreur lors de la sauvegarde';
        setError(errorMessage);
        toast.error(errorMessage);
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
      <div className="max-w-6xl">
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
                    disabled={followUnfollowLoading}
                  />
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
                disabled={styles.length >= 3}
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
                disabled={savingStyles || styles.length === 0 || styles.length > 3}
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
                disabled={savingMaxFollowings}
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

