"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean | null; // null = pas encore vérifié, false = pas admin, true = admin
  loading: boolean;
  checkAuth: (redirect?: string) => Promise<boolean>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_USER_KEY = 'auth_user';
const CACHE_ADMIN_KEY = 'auth_is_admin';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasInitialized = useRef(false);

  const refreshAdminStatus = useCallback(async (userId?: string): Promise<void> => {
    const userIdToCheck = userId || user?.id;
    if (!userIdToCheck) {
      setIsAdmin(false);
      return;
    }

    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const supabase = createClient();

      // Vérifier d'abord que l'utilisateur est bien authentifié
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser || authUser.id !== userIdToCheck) {
        setIsAdmin(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('type')
        .eq('id', userIdToCheck)
        .single();

      // Gérer les erreurs 406 et autres erreurs de manière gracieuse
      if (error) {
        // Si erreur 406 ou autre erreur, ne pas bloquer l'application
        if (error.code === 'PGRST116' || error.code === '406' || error.message?.includes('406')) {
          console.warn('Profil utilisateur non trouvé ou erreur de format:', error);
          setIsAdmin(false);
          return;
        } else {
          console.error('Erreur lors de la vérification admin:', error);
          setIsAdmin(false);
          return;
        }
      }

      const adminStatus = profile?.type === 'ADMIN';
      setIsAdmin(adminStatus);

      // Sauvegarder dans le cache
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_ADMIN_KEY, JSON.stringify({
            data: adminStatus,
            lastLoaded: Date.now(),
          }));
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du cache admin:', err);
      }
    } catch (err: any) {
      // Gérer les erreurs réseau ou autres exceptions
      if (err?.message?.includes('406') || err?.status === 406) {
        console.warn('Erreur 406 lors de la vérification admin, ignorée:', err);
        setIsAdmin(false);
      } else {
        console.error('Erreur lors de la vérification admin:', err);
        setIsAdmin(false);
      }
    }
  }, [user]);

  const checkAuth = useCallback(async (redirect?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        setIsAdmin(null);
        // Sauvegarder dans le cache
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_USER_KEY, JSON.stringify({
              data: null,
              lastLoaded: Date.now(),
            }));
          }
        } catch (err) {
          console.error('Erreur lors de la sauvegarde du cache:', err);
        }

        if (redirect) {
          // Utiliser replace au lieu de push pour éviter la boucle lors du retour en arrière
          router.replace(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
        }
        setLoading(false);
        return false;
      }

      setUser(authUser);

      // Sauvegarder dans le cache
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_USER_KEY, JSON.stringify({
            data: authUser,
            lastLoaded: Date.now(),
          }));
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du cache:', err);
      }

      // Vérifier le statut admin après avoir défini l'utilisateur
      await refreshAdminStatus(authUser.id);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'authentification:', err);
      setUser(null);
      setIsAdmin(null);
      setLoading(false);
      return false;
    }
  }, [router, refreshAdminStatus]);

  // Charger depuis le cache au démarrage (une seule fois)
  useEffect(() => {
    // Éviter les re-exécutions
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const loadFromCache = () => {
      try {
        const cachedUser = localStorage.getItem(CACHE_USER_KEY);
        const cachedAdmin = localStorage.getItem(CACHE_ADMIN_KEY);

        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          const now = Date.now();
          if (parsed.lastLoaded && (now - parsed.lastLoaded) < CACHE_DURATION) {
            setUser(parsed.data);
            if (cachedAdmin) {
              const adminParsed = JSON.parse(cachedAdmin);
              if (adminParsed.lastLoaded && (now - adminParsed.lastLoaded) < CACHE_DURATION) {
                setIsAdmin(adminParsed.data);
              }
            }
            setLoading(false);
            return true;
          } else {
            // Cache expiré
            localStorage.removeItem(CACHE_USER_KEY);
            localStorage.removeItem(CACHE_ADMIN_KEY);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du cache auth:', err);
        try {
          localStorage.removeItem(CACHE_USER_KEY);
          localStorage.removeItem(CACHE_ADMIN_KEY);
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
      }
      return false;
    };

    const performInitialAuth = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setIsAdmin(null);
          setLoading(false);
          return;
        }

        setUser(authUser);

        // Sauvegarder dans le cache
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_USER_KEY, JSON.stringify({
              data: authUser,
              lastLoaded: Date.now(),
            }));
          }
        } catch (err) {
          console.error('Erreur lors de la sauvegarde du cache:', err);
        }

        // Vérifier le statut admin (appel direct, pas via refreshAdminStatus pour éviter la boucle)
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('type')
            .eq('id', authUser.id)
            .single();

          // Gérer les erreurs 406 et autres erreurs de manière gracieuse
          if (error) {
            // Si erreur 406 ou autre erreur, ne pas bloquer l'application
            if (error.code === 'PGRST116' || error.code === '406' || error.message?.includes('406')) {
              console.warn('Profil utilisateur non trouvé ou erreur de format:', error);
              setIsAdmin(false);
            } else {
              console.error('Erreur lors de la vérification admin:', error);
              setIsAdmin(false);
            }
          } else {
            const adminStatus = profile?.type === 'ADMIN';
            setIsAdmin(adminStatus);

            // Sauvegarder dans le cache
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_ADMIN_KEY, JSON.stringify({
                  data: adminStatus,
                  lastLoaded: Date.now(),
                }));
              }
            } catch (err) {
              console.error('Erreur lors de la sauvegarde du cache admin:', err);
            }
          }
        } catch (err: any) {
          // Gérer les erreurs réseau ou autres exceptions
          if (err?.message?.includes('406') || err?.status === 406) {
            console.warn('Erreur 406 lors de la vérification admin, ignorée:', err);
            setIsAdmin(false);
          } else {
            console.error('Erreur lors de la vérification admin:', err);
            setIsAdmin(false);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la vérification initiale:', err);
        setUser(null);
        setIsAdmin(null);
        setLoading(false);
      }
    };

    const hasCache = loadFromCache();
    if (!hasCache) {
      // Vérifier l'authentification si pas de cache
      performInitialAuth();
    }
  }, []); // Pas de dépendances pour éviter les re-exécutions

  // Rafraîchir le statut admin si l'utilisateur change (mais seulement si nécessaire)
  const lastUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Si l'utilisateur a changé et qu'on n'a pas encore vérifié le statut admin
    if (user && user.id && user.id !== lastUserIdRef.current && isAdmin === null) {
      lastUserIdRef.current = user.id;
      // Vérifier que nous sommes côté client avant d'appeler refreshAdminStatus
      if (typeof window !== 'undefined') {
        refreshAdminStatus(user.id).catch((err: any) => {
          // Ignorer les erreurs 406 et autres erreurs de format
          if (err?.message?.includes('406') || err?.status === 406 || err?.code === '406') {
            console.warn('Erreur 406 ignorée lors du rafraîchissement admin:', err);
          } else {
            console.error('Erreur lors du rafraîchissement admin:', err);
          }
        });
      }
    } else if (!user) {
      lastUserIdRef.current = null;
      setIsAdmin(null);
      // Nettoyer le cache admin
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(CACHE_ADMIN_KEY);
        }
      } catch (err) {
        console.error('Erreur lors du nettoyage du cache admin:', err);
      }
    }
  }, [user?.id, isAdmin, refreshAdminStatus]); // Ajouter refreshAdminStatus aux dépendances

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        checkAuth,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
