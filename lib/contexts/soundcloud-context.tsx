"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

interface TokenStatus {
  valid: boolean;
  connected: boolean;
  message: string;
  needsReauth?: boolean;
  username?: string;
  soundcloudUserId?: number;
  lastVerified?: number; // timestamp de la dernière vérification
}

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

interface SoundCloudContextType {
  tokenStatus: TokenStatus | null;
  checkingToken: boolean;
  verifyToken: (force?: boolean, showToast?: boolean) => Promise<void>;
  clearTokenStatus: () => void;

  // Données utilisateur SoundCloud
  soundcloudUser: SoundCloudUser | null;
  loadingUser: boolean;
  loadSoundCloudUser: (force?: boolean) => Promise<void>;

  // Configuration SoundCloud
  config: SoundCloudConfig | null;
  loadingConfig: boolean;
  loadConfig: (force?: boolean) => Promise<void>;
  updateConfig: (updates: Partial<SoundCloudConfig>) => Promise<SoundCloudConfig | undefined>;

  // Automation
  automation: boolean | null;
  loadingAutomation: boolean;
  loadAutomation: (force?: boolean) => Promise<void>;
  updateAutomation: (value: boolean) => Promise<void>;

  // État de préchargement initial
  initialLoadComplete: boolean;
}

const SoundCloudContext = createContext<SoundCloudContextType | undefined>(undefined);

const CACHE_KEY = 'soundcloud_token_status';
const CACHE_USER_KEY = 'soundcloud_user_data';
const CACHE_CONFIG_KEY = 'soundcloud_config_data';
const CACHE_AUTOMATION_KEY = 'soundcloud_automation';
const SESSION_LOADED_KEY = 'soundcloud_session_loaded'; // Track if data was loaded in this session
const HARD_REFRESH_HANDLED_KEY = 'soundcloud_hard_refresh_handled'; // Track if we already handled the hard refresh
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes pour le token
const CACHE_DATA_DURATION = 60 * 60 * 1000; // 1 heure pour les données

// Debug mode - mettre à true pour voir les logs
const DEBUG = false;

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[SoundCloud Context]', ...args);
  }
}

// Vérifie si c'est un rechargement dur (hard refresh)
// Cette fonction ne retourne true qu'UNE SEULE FOIS par hard refresh réel
function isHardRefresh(): boolean {
  if (typeof window === 'undefined') return false;

  // Si on a déjà géré le hard refresh dans cette session, retourner false
  const alreadyHandled = sessionStorage.getItem(HARD_REFRESH_HANDLED_KEY) === 'true';
  if (alreadyHandled) {
    debugLog('Hard refresh already handled in this session');
    return false;
  }

  // Vérifier si c'est vraiment un reload
  const performanceEntries = performance.getEntriesByType('navigation');
  if (performanceEntries.length > 0) {
    const navEntry = performanceEntries[0] as PerformanceNavigationTiming;
    const isReload = navEntry.type === 'reload';

    // Marquer comme géré pour ne pas re-détecter lors des navigations SPA
    sessionStorage.setItem(HARD_REFRESH_HANDLED_KEY, 'true');

    debugLog('Navigation type:', navEntry.type, '- isReload:', isReload);
    return isReload;
  }

  // Si pas d'entrée de navigation, marquer quand même comme géré
  sessionStorage.setItem(HARD_REFRESH_HANDLED_KEY, 'true');
  return false;
}

// Charge les données cachées de façon synchrone
function getInitialCachedUser(): SoundCloudUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_USER_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
        debugLog('Loaded user from cache:', parsed.data?.username);
        return parsed.data;
      }
    }
  } catch (err) {
    console.error('Error loading cached user:', err);
  }
  return null;
}

function getInitialCachedTokenStatus(): TokenStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (parsed.lastVerified && (now - parsed.lastVerified) < CACHE_DURATION) {
        debugLog('Loaded token status from cache:', parsed.valid ? 'valid' : 'invalid');
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading cached token status:', err);
  }
  return null;
}

function getInitialCachedConfig(): SoundCloudConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_CONFIG_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
        debugLog('Loaded config from cache');
        return parsed.data;
      }
    }
  } catch (err) {
    console.error('Error loading cached config:', err);
  }
  return null;
}

function getInitialCachedAutomation(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_AUTOMATION_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
        debugLog('Loaded automation from cache:', parsed.data);
        return parsed.data;
      }
    }
  } catch (err) {
    console.error('Error loading cached automation:', err);
  }
  return null;
}

function isSessionAlreadyLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_LOADED_KEY) === 'true';
}

export function SoundCloudProvider({ children }: { children: ReactNode }) {
  // États initialisés à null pour éviter le mismatch d'hydratation SSR
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [checkingToken, setCheckingToken] = useState(false);
  const [soundcloudUser, setSoundcloudUser] = useState<SoundCloudUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [config, setConfig] = useState<SoundCloudConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [automation, setAutomation] = useState<boolean | null>(null);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sessionDataLoaded, setSessionDataLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Charger le cache immédiatement après le montage (côté client uniquement)
  // useLayoutEffect pour charger AVANT le paint et éviter le flash
  React.useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedUser = getInitialCachedUser();
      const cachedToken = getInitialCachedTokenStatus();
      const cachedConfig = getInitialCachedConfig();
      const cachedAutomation = getInitialCachedAutomation();
      const sessionLoaded = isSessionAlreadyLoaded();

      if (cachedUser) {
        setSoundcloudUser(cachedUser);
        debugLog('Loaded user from cache after mount:', cachedUser.username);
      }
      if (cachedToken) {
        setTokenStatus(cachedToken);
      }
      if (cachedConfig) {
        setConfig(cachedConfig);
      }
      if (cachedAutomation !== null) {
        setAutomation(cachedAutomation);
      }
      if (cachedUser) {
        setInitialLoadComplete(true);
      }
      setSessionDataLoaded(sessionLoaded);
      setMounted(true);
    }
  }, []);

  const tokenStatusRef = useRef<TokenStatus | null>(null);
  const soundcloudUserRef = useRef<SoundCloudUser | null>(null);
  const configRef = useRef<SoundCloudConfig | null>(null);
  const automationRef = useRef<boolean | null>(null);

  // Synchroniser les refs avec les states
  useEffect(() => {
    tokenStatusRef.current = tokenStatus;
  }, [tokenStatus]);

  useEffect(() => {
    soundcloudUserRef.current = soundcloudUser;
  }, [soundcloudUser]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    automationRef.current = automation;
  }, [automation]);

  // Sauvegarder dans le cache
  const saveToCache = useCallback((status: TokenStatus) => {
    try {
      if (typeof window !== 'undefined') {
        const toCache = {
          ...status,
          lastVerified: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du cache:', err);
    }
  }, []);

  const verifyToken = useCallback(async (force: boolean = false, showToast: boolean = false) => {
    // Si pas de force et qu'on a un cache valide, ne pas vérifier
    if (!force && typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (parsed.lastVerified && (now - parsed.lastVerified) < CACHE_DURATION) {
            // Mettre à jour le state avec le cache si nécessaire
            if (!tokenStatusRef.current || tokenStatusRef.current.lastVerified !== parsed.lastVerified) {
              setTokenStatus(parsed);
            }
            return; // Utiliser le cache
          }
        } catch (err) {
          // Erreur de parsing, continuer avec la vérification
        }
      }
    }

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
        const status: TokenStatus = {
          ...data,
          lastVerified: Date.now(),
        };
        setTokenStatus(status);
        saveToCache(status);

        if (showToast) {
          if (data.valid) {
            toast.success('Token SoundCloud valide');
          } else {
            toast.error('Token SoundCloud invalide');
          }
        }
      } else {
        console.error('Erreur vérification token:', data);
        const errorMessage = data.message || data.error || 'Erreur lors de la vérification';
        const status: TokenStatus = {
          valid: false,
          connected: false,
          message: errorMessage,
          needsReauth: response.status === 401 || response.status === 404,
          lastVerified: Date.now(),
        };
        setTokenStatus(status);
        saveToCache(status);

        if (showToast) {
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de la vérification du token:', err);
      let errorMessage = 'Erreur de connexion lors de la vérification';
      if (err.name === 'AbortError') {
        errorMessage = 'Timeout - La vérification a pris trop de temps';
      } else {
        errorMessage = err.message || errorMessage;
      }

      const status: TokenStatus = {
        valid: false,
        connected: false,
        message: errorMessage,
        needsReauth: true,
        lastVerified: Date.now(),
      };
      setTokenStatus(status);
      saveToCache(status);

      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setCheckingToken(false);
    }
  }, [saveToCache]);

  // Charger le cache au démarrage (après la définition de verifyToken)
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    const loadCachedStatus = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          // Utiliser le cache seulement s'il est récent (moins de 5 minutes)
          if (parsed.lastVerified && (now - parsed.lastVerified) < CACHE_DURATION) {
            setTokenStatus(parsed);
            return true;
          } else {
            // Cache expiré, le supprimer
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cache:', err);
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
      }
      return false;
    };

    // Charger le cache et vérifier le token si nécessaire
    const hasValidCache = loadCachedStatus();
    if (!hasValidCache) {
      // Vérifier le token au démarrage si pas de cache valide
      verifyToken(false).catch((err) => {
        console.error('Erreur lors de la vérification initiale du token:', err);
      });
    }
  }, [verifyToken]);

  const clearTokenStatus = useCallback(() => {
    setTokenStatus(null);
    setSoundcloudUser(null);
    setConfig(null);
    setAutomation(null);
    setSessionDataLoaded(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_USER_KEY);
        localStorage.removeItem(CACHE_CONFIG_KEY);
        localStorage.removeItem(CACHE_AUTOMATION_KEY);
        sessionStorage.removeItem(SESSION_LOADED_KEY);
        sessionStorage.removeItem(HARD_REFRESH_HANDLED_KEY);
      } catch (err) {
        console.error('Erreur lors du nettoyage du cache:', err);
      }
    }
  }, []);

  // Fonction pour charger l'utilisateur SoundCloud
  const loadSoundCloudUser = useCallback(async (force: boolean = false) => {
    // Vérifier le cache d'abord
    if (!force && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_USER_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
            setSoundcloudUser(parsed.data);
            return;
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cache utilisateur:', err);
      }
    }

    // Si déjà chargé et pas de force, ne pas recharger
    if (!force && soundcloudUserRef.current) return;

    setLoadingUser(true);
    try {
      const response = await fetch('/api/auth/soundcloud/user');
      if (response.ok) {
        const userData = await response.json();
        setSoundcloudUser(userData);
        // Mettre en cache
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_USER_KEY, JSON.stringify({
              data: userData,
              lastLoaded: Date.now(),
            }));
          }
        } catch (err) {
          console.error('Erreur lors de la sauvegarde du cache utilisateur:', err);
        }
      } else if (response.status === 401) {
        // Pas connecté à SoundCloud - c'est normal, ne pas logger d'erreur
        setSoundcloudUser(null);
        // Nettoyer le cache si présent
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(CACHE_USER_KEY);
          }
        } catch (err) {
          // Ignorer les erreurs de nettoyage du cache
        }
      } else {
        // Autre erreur HTTP - logger seulement si ce n'est pas un 401
        console.error('Erreur lors du chargement de l\'utilisateur SoundCloud:', response.status, response.statusText);
      }
    } catch (err) {
      // Ne logger que les erreurs réseau, pas les 401 attendus
      console.error('Erreur réseau lors du chargement de l\'utilisateur SoundCloud:', err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Fonction pour charger la configuration
  const loadConfig = useCallback(async (force: boolean = false) => {
    // Vérifier le cache d'abord
    if (!force && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_CONFIG_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
            setConfig(parsed.data);
            return;
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cache config:', err);
      }
    }

    // Si déjà chargé et pas de force, ne pas recharger
    if (!force && configRef.current) return;

    setLoadingConfig(true);
    try {
      const response = await fetch('/api/user/soundcloud/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
          // Mettre en cache
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify({
                data: data.config,
                lastLoaded: Date.now(),
              }));
            }
          } catch (err) {
            console.error('Erreur lors de la sauvegarde du cache config:', err);
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  // Fonction pour mettre à jour la configuration
  const updateConfig = useCallback(async (updates: Partial<SoundCloudConfig>) => {
    try {
      const response = await fetch('/api/user/soundcloud/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
          // Mettre à jour le cache
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify({
                data: data.config,
                lastLoaded: Date.now(),
              }));
            }
          } catch (err) {
            console.error('Erreur lors de la mise à jour du cache config:', err);
          }
        }
        return data.config;
      }
      throw new Error('Erreur lors de la mise à jour');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la configuration:', err);
      throw err;
    }
  }, []);

  // Fonction pour charger l'automation
  const loadAutomation = useCallback(async (force: boolean = false) => {
    // Vérifier le cache d'abord
    if (!force && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_AUTOMATION_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DATA_DURATION) {
            setAutomation(parsed.data);
            return;
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cache automation:', err);
      }
    }

    // Si déjà chargé et pas de force, ne pas recharger
    if (!force && automationRef.current !== null) return;

    setLoadingAutomation(true);
    try {
      const response = await fetch('/api/user/automation');
      if (response.ok) {
        const data = await response.json();
        const automationValue = data.automation || false;
        setAutomation(automationValue);
        // Mettre en cache
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_AUTOMATION_KEY, JSON.stringify({
              data: automationValue,
              lastLoaded: Date.now(),
            }));
          }
        } catch (err) {
          console.error('Erreur lors de la sauvegarde du cache automation:', err);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'automation:', err);
    } finally {
      setLoadingAutomation(false);
    }
  }, []);

  // Fonction pour mettre à jour l'automation
  const updateAutomation = useCallback(async (value: boolean) => {
    try {
      const response = await fetch('/api/user/automation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ automation: value }),
      });

      if (response.ok) {
        const data = await response.json();
        setAutomation(data.automation);
        // Mettre à jour le cache
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_AUTOMATION_KEY, JSON.stringify({
              data: data.automation,
              lastLoaded: Date.now(),
            }));
          }
        } catch (err) {
          console.error('Erreur lors de la mise à jour du cache automation:', err);
        }
        return data.automation;
      }
      throw new Error('Erreur lors de la mise à jour');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'automation:', err);
      throw err;
    }
  }, []);

  // Préchargement initial des données - exécuté une seule fois au montage
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      setInitialLoadComplete(true);
      return;
    }

    const preloadData = async () => {
      // Vérifier si c'est un hard refresh
      const hardRefresh = isHardRefresh();
      // Lire les valeurs cachées directement (pas via les states qui peuvent être stale)
      const cachedUser = getInitialCachedUser();
      const hasCachedUser = cachedUser !== null;

      debugLog('Preload check:', {
        hardRefresh,
        hasCachedUser,
      });

      // Si les données sont déjà chargées depuis le cache et ce n'est pas un hard refresh, skip
      if (!hardRefresh && hasCachedUser) {
        debugLog('Skipping preload - data already loaded from cache');
        sessionStorage.setItem(SESSION_LOADED_KEY, 'true');
        setSessionDataLoaded(true);
        setInitialLoadComplete(true);
        return;
      }

      // Si c'est un hard refresh, on force le rechargement
      if (hardRefresh) {
        debugLog('Hard refresh detected - forcing reload');
      }

      // Vérifier l'authentification Supabase d'abord
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          debugLog('No authenticated user, skipping SoundCloud load');
          setInitialLoadComplete(true);
          return;
        }

        // Si hard refresh, forcer le rechargement
        const forceRefresh = hardRefresh;
        debugLog('Loading SoundCloud data...', { forceRefresh });

        // Charger toutes les données en parallèle
        await Promise.all([
          loadSoundCloudUser(forceRefresh).catch((err) => {
            // Ne pas logger les erreurs 401 car c'est normal si l'utilisateur n'est pas connecté à SoundCloud
            if (err?.status !== 401 && err?.response?.status !== 401) {
              console.error('Erreur lors du chargement de l\'utilisateur SoundCloud:', err);
            }
          }),
          loadConfig(forceRefresh).catch((err) => {
            console.error('Erreur lors du chargement de la config:', err);
          }),
          loadAutomation(forceRefresh).catch((err) => {
            console.error('Erreur lors du chargement de l\'automation:', err);
          }),
        ]);

        debugLog('SoundCloud data loaded successfully');

        // Marquer la session comme ayant chargé les données
        sessionStorage.setItem(SESSION_LOADED_KEY, 'true');
        setSessionDataLoaded(true);
      } catch (err) {
        console.error('Erreur lors du préchargement:', err);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    preloadData();
    // Ce useEffect ne doit s'exécuter qu'une seule fois au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vérifier automatiquement le token quand l'utilisateur SoundCloud est chargé
  // Mais seulement si le token n'a pas encore été vérifié dans cette session
  useEffect(() => {
    if (soundcloudUser && initialLoadComplete) {
      // Si on a un utilisateur SoundCloud mais pas de tokenStatus valide, vérifier le token
      // Mais seulement si ce n'est pas déjà en cours de vérification
      if ((!tokenStatus || !tokenStatus.valid) && !checkingToken) {
        verifyToken(false, false).catch((err) => {
          console.error('Erreur lors de la vérification automatique du token:', err);
        });
      }
    }
  }, [soundcloudUser, initialLoadComplete, tokenStatus, checkingToken, verifyToken]);

  return (
    <SoundCloudContext.Provider
      value={{
        tokenStatus,
        checkingToken,
        verifyToken,
        clearTokenStatus,
        soundcloudUser,
        loadingUser,
        loadSoundCloudUser,
        config,
        loadingConfig,
        loadConfig,
        updateConfig,
        automation,
        loadingAutomation,
        loadAutomation,
        updateAutomation,
        initialLoadComplete,
      }}
    >
      {children}
    </SoundCloudContext.Provider>
  );
}

export function useSoundCloud() {
  const context = useContext(SoundCloudContext);
  if (context === undefined) {
    throw new Error('useSoundCloud must be used within a SoundCloudProvider');
  }
  return context;
}

