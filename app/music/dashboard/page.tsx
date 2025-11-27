"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Dashboard } from "@/components/layout/dashboard";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

interface SoundCloudUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string;
  permalink_url: string;
  city?: string;
  country?: string;
  description?: string;
  followers_count?: number;
  followings_count?: number;
  public_favorites_count?: number;
  track_count?: number;
  playlist_count?: number;
  plan?: string;
}

export default function MusicDashboard() {
  const router = useRouter();
  const { t } = useI18n();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [soundcloudUser, setSoundcloudUser] = useState<SoundCloudUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automation, setAutomation] = useState<boolean>(false);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{
    valid: boolean;
    connected: boolean;
    message: string;
    needsReauth?: boolean;
    username?: string;
  } | null>(null);
  const [checkingToken, setCheckingToken] = useState(false);

  useEffect(() => {
    checkSupabaseAuth();
  }, []);

  // Recharger les données SoundCloud si on revient du callback
  useEffect(() => {
    if (supabaseUser && !loading) {
      // Vérifier si on vient du callback SoundCloud
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('soundcloud_connected')) {
        // Nettoyer l'URL
        window.history.replaceState({}, '', '/music/dashboard');
        // Recharger les données SoundCloud
        const reloadSoundCloud = async () => {
          try {
            const response = await fetch('/api/auth/soundcloud/user');
            if (response.ok) {
              const userData = await response.json();
              setSoundcloudUser(userData);
            }
          } catch (err) {
            console.error('Erreur SoundCloud:', err);
            toast.error('Erreur lors du chargement des données SoundCloud');
          }
        };
        reloadSoundCloud();
      }
    }
  }, [supabaseUser, loading]);

  const checkSupabaseAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth/login?redirect=/music/dashboard');
        return;
      }

      setSupabaseUser(user);
      // Une fois authentifié Supabase, vérifier SoundCloud et charger l'automation
      fetchSoundCloudData();
      fetchAutomation();
      // Vérifier le token après un court délai pour laisser le temps aux autres requêtes
      setTimeout(() => {
        verifyToken();
      }, 500);
    } catch (err) {
      setError('Erreur de vérification de l\'authentification');
      setLoading(false);
    }
  };

  const fetchSoundCloudData = async () => {
    try {
      const response = await fetch('/api/auth/soundcloud/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Pas connecté à SoundCloud, mais c'est OK, on affiche le bouton
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setSoundcloudUser(userData);
    } catch (err) {
      // Erreur mais on continue, l'utilisateur pourra se connecter
      console.error('Erreur SoundCloud:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSoundCloudLogin = () => {
    router.push('/api/auth/soundcloud');
  };

  const handleLogout = () => {
    // Supprimer les cookies
    document.cookie = 'soundcloud_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'soundcloud_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/music');
  };

  const fetchAutomation = async () => {
    try {
      const response = await fetch('/api/user/automation');
      if (response.ok) {
        const data = await response.json();
        setAutomation(data.automation || false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'automation:', err);
      toast.error('Erreur lors du chargement de l\'automation');
    }
  };

  const handleAutomationToggle = async (checked: boolean) => {
    setAutomationLoading(true);
    try {
      const response = await fetch('/api/user/automation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ automation: checked }),
      });

      if (response.ok) {
        const data = await response.json();
        setAutomation(data.automation);
        toast.success(`Automation ${data.automation ? 'activée' : 'désactivée'}`);
      } else {
        const errorMessage = 'Erreur lors de la mise à jour de l\'automation';
        console.error(errorMessage);
        toast.error(errorMessage);
        // Revenir à l'état précédent en cas d'erreur
        setAutomation(!checked);
      }
    } catch (err) {
      const errorMessage = 'Erreur lors de la mise à jour de l\'automation';
      console.error(errorMessage, err);
      toast.error(errorMessage);
      // Revenir à l'état précédent en cas d'erreur
      setAutomation(!checked);
    } finally {
      setAutomationLoading(false);
    }
  };

  const verifyToken = async () => {
    setCheckingToken(true);
    try {
      // Timeout de sécurité pour éviter que la requête reste bloquée
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes max
      
      const response = await fetch('/api/user/soundcloud/verify-token', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Si la réponse n'est pas du JSON valide
        throw new Error('Réponse invalide du serveur');
      }
      
      // Toujours définir le statut, même en cas d'erreur HTTP
      if (response.ok) {
        setTokenStatus(data);
        if (data.valid) {
          toast.success('Token SoundCloud valide');
        } else {
          toast.error('Token SoundCloud invalide');
        }
      } else {
        console.error('Erreur vérification token:', data);
        const errorMessage = data.message || data.error || 'Erreur lors de la vérification';
        // Si c'est une erreur 401 ou 404, on considère qu'il faut se réauthentifier
        setTokenStatus({
          valid: false,
          connected: false,
          message: errorMessage,
          needsReauth: response.status === 401 || response.status === 404,
        });
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Erreur lors de la vérification du token:', err);
      let errorMessage = 'Erreur de connexion lors de la vérification';
      if (err.name === 'AbortError') {
        errorMessage = 'Timeout - La vérification a pris trop de temps';
        setTokenStatus({
          valid: false,
          connected: false,
          message: errorMessage,
          needsReauth: true,
        });
      } else {
        errorMessage = err.message || errorMessage;
        setTokenStatus({
          valid: false,
          connected: false,
          message: errorMessage,
          needsReauth: true,
        });
      }
      toast.error(errorMessage);
    } finally {
      setCheckingToken(false);
    }
  };

  const handleReauth = () => {
    router.push('/api/auth/soundcloud');
  };

  if (loading) {
    return (
      <Dashboard title="Tableau de bord">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard title="Tableau de bord">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-xl mb-4">Erreur: {error}</div>
          <Button onClick={() => router.push('/music')}>
            Retour à la page Music
          </Button>
        </div>
      </Dashboard>
    );
  }

  // Si pas connecté à SoundCloud, afficher le bouton de connexion
  if (!soundcloudUser) {
    return (
      <Dashboard title="Tableau de bord">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold text-secondary mb-4">
              Connectez votre compte SoundCloud
            </h2>
            <p className="text-gray-600 mb-8">
              Pour accéder à votre dashboard SoundCloud, vous devez d'abord connecter votre compte SoundCloud.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleSoundCloudLogin}
              className="flex items-center gap-2 mx-auto"
            >
              {t("music.cta")}
              <ArrowIcon size={18} />
            </Button>
          </CardContent>
        </Card>
      </Dashboard>
    );
  }

  return (
    <Dashboard title="Tableau de bord">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {soundcloudUser.followers_count !== undefined && (
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-1">
                {soundcloudUser.followers_count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Abonnés</div>
            </CardContent>
          </Card>
        )}
        {soundcloudUser.followings_count !== undefined && (
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-1">
                {soundcloudUser.followings_count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Abonnements</div>
            </CardContent>
          </Card>
        )}
        {soundcloudUser.track_count !== undefined && (
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-1">
                {soundcloudUser.track_count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tracks</div>
            </CardContent>
          </Card>
        )}
        {soundcloudUser.playlist_count !== undefined && (
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-secondary mb-1">
                {soundcloudUser.playlist_count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Playlists</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Carte profil utilisateur */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {soundcloudUser.avatar_url && (
              <img
                src={soundcloudUser.avatar_url}
                alt={soundcloudUser.username}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-secondary mb-2">
                {soundcloudUser.full_name || soundcloudUser.username}
              </h2>
              <p className="text-gray-600 mb-4">@{soundcloudUser.username}</p>
              {soundcloudUser.description && (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {soundcloudUser.description}
                </p>
              )}
              {soundcloudUser.permalink_url && (
                <a
                  href={soundcloudUser.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium"
                >
                  Voir le profil SoundCloud
                  <ArrowIcon size={16} />
                </a>
              )}
              {(soundcloudUser.city || soundcloudUser.country) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {soundcloudUser.city && <span>{soundcloudUser.city}</span>}
                    {soundcloudUser.city && soundcloudUser.country && <span>, </span>}
                    {soundcloudUser.country && <span>{soundcloudUser.country}</span>}
                  </p>
                </div>
              )}
              {soundcloudUser.plan && (
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Plan: {soundcloudUser.plan}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Statut du token SoundCloud */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-secondary">
                  Statut de la connexion SoundCloud
                </Label>
                <p className="text-sm text-gray-600">
                  Vérification de la validité du token
                </p>
              </div>
              {checkingToken ? (
                <div className="text-sm text-gray-500">Vérification...</div>
              ) : tokenStatus ? (
                <div className="flex items-center gap-2">
                  {tokenStatus.valid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Valide
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Invalide
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={verifyToken}
                    className="text-xs"
                  >
                    Vérifier
                  </Button>
                </div>
              ) : null}
            </div>
            {tokenStatus && !tokenStatus.valid && tokenStatus.needsReauth && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  {tokenStatus.message}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReauth}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Se réauthentifier avec SoundCloud
                </Button>
              </div>
            )}
            {tokenStatus && tokenStatus.valid && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Token valide - Connexion active</p>
                {tokenStatus.username && (
                  <p className="text-xs text-gray-500 mt-1">
                    Compte: @{tokenStatus.username}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Toggle Automation */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="automation" className="text-base font-medium text-secondary">
                  Automation
                </Label>
                <p className="text-sm text-gray-600">
                  Activez l'automatisation pour votre compte SoundCloud
                </p>
              </div>
              <Switch
                id="automation"
                checked={automation}
                onCheckedChange={handleAutomationToggle}
                disabled={automationLoading || !tokenStatus?.valid}
              />
            </div>
            {!tokenStatus?.valid && (
              <p className="text-xs text-gray-500 mt-2">
                Le token doit être valide pour activer l'automation
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Dashboard>
  );
}




