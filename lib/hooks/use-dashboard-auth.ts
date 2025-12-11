"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSoundCloud } from "@/lib/contexts/soundcloud-context";
import { useAuth } from "@/lib/contexts/auth-context";

interface UseDashboardAuthOptions {
    /** URL de redirection pour l'authentification (défaut: page actuelle) */
    redirectUrl?: string;
    /** Requiert une connexion SoundCloud pour afficher le contenu */
    requireSoundCloud?: boolean;
}

interface UseDashboardAuthReturn {
    /** L'utilisateur est authentifié et prêt */
    isReady: boolean;
    /** Affiche le skeleton de chargement */
    showSkeleton: boolean;
    /** Affiche l'état de chargement simple (texte) */
    showLoading: boolean;
    /** En cours de vérification de l'auth (ne rien afficher) */
    isCheckingAuth: boolean;
    /** Erreur d'authentification */
    error: string | null;
    /** L'utilisateur est connecté à SoundCloud */
    isSoundCloudConnected: boolean;
    /** Les données SoundCloud sont en cache */
    hasCachedData: boolean;
    /** L'utilisateur Supabase */
    user: any;
    /** Router Next.js */
    router: ReturnType<typeof useRouter>;
}

/**
 * Hook pour gérer l'authentification et le chargement des pages dashboard.
 * Factorise la logique de vérification d'auth et de cache SoundCloud.
 * 
 * @example
 * ```tsx
 * const { isReady, showSkeleton, error, isSoundCloudConnected } = useDashboardAuth({
 *   redirectUrl: '/music/dashboard',
 *   requireSoundCloud: false,
 * });
 * 
 * if (showSkeleton) {
 *   return <SkeletonComponent />;
 * }
 * 
 * if (error) {
 *   return <ErrorComponent error={error} />;
 * }
 * 
 * // Afficher le contenu normal
 * ```
 */
export function useDashboardAuth(options: UseDashboardAuthOptions = {}): UseDashboardAuthReturn {
    const { redirectUrl, requireSoundCloud = false } = options;
    const router = useRouter();

    const {
        tokenStatus,
        soundcloudUser,
        loadingUser,
        config,
        initialLoadComplete,
        loadSoundCloudUser,
        loadConfig,
        loadAutomation,
    } = useSoundCloud();

    const { user, loading: authLoading, checkAuth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Si l'utilisateur est déjà connu, pas besoin de vérifier l'auth
    const [authCheckComplete, setAuthCheckComplete] = useState(user !== null);
    const authCheckStarted = useRef(user !== null);
    const hasLoadedSoundCloudData = useRef(false);

    // Vérifier l'authentification seulement une fois au montage initial
    // ET seulement si on n'a pas déjà un user dans le contexte
    useEffect(() => {
        // Si l'utilisateur est déjà authentifié, pas besoin de vérifier
        if (user) {
            setAuthCheckComplete(true);
            setLoading(false);
            return;
        }

        if (!authCheckStarted.current) {
            authCheckStarted.current = true;
            const url = redirectUrl || (typeof window !== 'undefined' ? window.location.pathname : '/');
            checkAuth(url).then((isAuthenticated) => {
                if (isAuthenticated) {
                    setLoading(false);
                } else {
                    setError('Non authentifié');
                    setLoading(false);
                }
                setAuthCheckComplete(true);
            });
        }
    }, [checkAuth, redirectUrl, user]);

    // Charger les données SoundCloud quand l'utilisateur Supabase devient disponible
    // Cela corrige le cas où le préchargement a été fait avant que l'auth soit prête
    useEffect(() => {
        if (user && !authLoading && !soundcloudUser && !loadingUser && !hasLoadedSoundCloudData.current) {
            hasLoadedSoundCloudData.current = true;
            Promise.all([
                loadSoundCloudUser(false),
                loadConfig(false),
                loadAutomation(false),
            ]).catch(() => {
                // Silently ignore errors - they are handled in individual loaders
            });
        }
    }, [user, authLoading, soundcloudUser, loadingUser, loadSoundCloudUser, loadConfig, loadAutomation]);

    // Attendre que le préchargement soit terminé
    useEffect(() => {
        if (initialLoadComplete && !authLoading && user) {
            setLoading(false);
        }
    }, [initialLoadComplete, authLoading, user]);

    // Vérifier si les données SoundCloud sont en cache
    const hasCachedData = soundcloudUser !== null || config !== null;

    // L'utilisateur est connecté à SoundCloud
    const isSoundCloudConnected = soundcloudUser !== null;

    // Déterminer si on doit afficher le skeleton
    const isInitialLoading = !initialLoadComplete || authLoading;
    const isUserLoading = loadingUser && !soundcloudUser;
    const isWaitingForDataLoad = !!(user && !authLoading && !soundcloudUser && !loadingUser && !hasLoadedSoundCloudData.current);
    const showSkeleton = (!hasCachedData && isInitialLoading) || isUserLoading || isWaitingForDataLoad;

    // Afficher le loading simple (texte) si pas de données en cache
    const showLoading = !hasCachedData && loading;

    // L'utilisateur est prêt (authentifié et données chargées)
    const isReady = !showSkeleton && !error && user !== null && initialLoadComplete;

    // En cours de vérification de l'auth (ne rien afficher pour éviter le flash)
    const isCheckingAuth = !authCheckComplete || authLoading;

    return {
        isReady,
        showSkeleton,
        showLoading,
        isCheckingAuth,
        error,
        isSoundCloudConnected,
        hasCachedData,
        user,
        router,
    };
}
