"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dashboard } from "@/components/layout/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "@/components/ui/toast";
import { AlertCircle, Music, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Error {
  id: number;
  created_at: string;
  user_id: string | null;
  fullname: string | null;
  platform: string;
  error_message: string | null;
  log_message: string | null;
}

interface GroupedErrors {
  soundcloud: Error[];
  other: Error[];
}

export default function AdminLogsPage() {
  const router = useRouter();
  const { user, isAdmin: contextIsAdmin, loading: authLoading, refreshAdminStatus, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState<GroupedErrors>({ soundcloud: [], other: [] });
  const [error, setError] = useState<string | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'logs' | 'errors'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const hasCheckedAdmin = useRef(false);

  useEffect(() => {
    if (authLoading || hasCheckedAdmin.current) return;

    if (!user) {
      checkAuth('/music/dashboard/admin/logs');
      return;
    }

    hasCheckedAdmin.current = true;
    checkAdminAndLoad();
  }, [authLoading, user]);

  // Vérifier le rôle admin à chaque accès à la page
  const checkAdminAndLoad = async () => {
    try {
      // Vérifier l'authentification d'abord
      if (!user) {
        const isAuthenticated = await checkAuth('/music/dashboard/admin/logs');
        if (!isAuthenticated) {
          return;
        }
        // Attendre que le contexte se mette à jour
        return;
      }

      // Toujours vérifier le rôle admin à chaque accès (sécurité)
      const supabase = createClient();
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.type !== 'ADMIN') {
        toast.error('Accès refusé. Vous devez être administrateur.');
        router.push('/music/dashboard');
        return;
      }

      setIsAdmin(true);
      // Mettre à jour le contexte aussi
      await refreshAdminStatus();
      // Charger les erreurs
      await loadErrors();
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur de vérification de l\'authentification');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadErrors = async () => {
    try {
      const response = await fetch('/api/user/logs');
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || { soundcloud: [], other: [] });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des erreurs');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des erreurs:', err);
      setError('Erreur lors du chargement des erreurs');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleError = (errorId: number) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  // Combiner toutes les erreurs pour la pagination
  const allErrors = [...errors.soundcloud, ...errors.other]
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'errors') return !!item.error_message;
      if (filter === 'logs') return !item.error_message && !!item.log_message;
      return true;
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Calculer la pagination
  const totalPages = Math.ceil(allErrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedErrors = allErrors.slice(startIndex, endIndex);

  // Grouper les erreurs paginées par plateforme
  const paginatedGroupedErrors: GroupedErrors = {
    soundcloud: paginatedErrors.filter((e) => e.platform === 'soundcloud'),
    other: paginatedErrors.filter((e) => e.platform === 'other'),
  };

  if (loading || authLoading) {
    return (
      <Dashboard title="Logs">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </Dashboard>
    );
  }

  if (!isAdmin) {
    return (
      <Dashboard title="Logs">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">Accès refusé. Vous devez être administrateur.</div>
          </CardContent>
        </Card>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard title="Logs">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      </Dashboard>
    );
  }

  const totalErrors = errors.soundcloud.length + errors.other.length;

  return (
    <Dashboard
      title="Logs"
      filters={
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Tout
          </button>
          <button
            onClick={() => { setFilter('logs'); setCurrentPage(1); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${filter === 'logs'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Succès
          </button>
          <button
            onClick={() => { setFilter('errors'); setCurrentPage(1); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${filter === 'errors'
              ? 'bg-white text-red-700 shadow-sm'
              : 'text-gray-500 hover:text-red-600'
              }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Erreurs
          </button>
        </div>
      }
    >
      <div className="w-full space-y-6">
        {/* En-tête avec statistiques */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                  Logs & Erreurs N8N
                </h2>
                <p className="text-gray-600">
                  {totalErrors === 0
                    ? "Aucun log enregistré"
                    : `${totalErrors} entrée${totalErrors > 1 ? 's' : ''} enregistrée${totalErrors > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {totalErrors > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {allErrors.length}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section SoundCloud */}
        {paginatedGroupedErrors.soundcloud.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                SoundCloud
                <Badge variant="secondary" className="ml-2">
                  {errors.soundcloud.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paginatedGroupedErrors.soundcloud.map((error) => {
                  const isExpanded = expandedErrors.has(error.id);
                  const isError = !!error.error_message;
                  const style = isError
                    ? { bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:bg-red-100', text: 'text-red-900', iconColor: 'text-red-600' }
                    : { bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100', text: 'text-green-900', iconColor: 'text-green-600' };

                  return (
                    <div
                      key={error.id}
                      className={`border ${style.border} ${style.bg} rounded-lg overflow-hidden`}
                    >
                      <button
                        onClick={() => toggleError(error.id)}
                        className={`w-full p-4 flex items-start justify-between ${style.hover} transition-colors`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {isError ? (
                            <AlertCircle className={`h-5 w-5 ${style.iconColor} flex-shrink-0`} />
                          ) : (
                            <CheckCircle className={`h-5 w-5 ${style.iconColor} flex-shrink-0`} />
                          )}
                          <div className="text-left">
                            <span className={`font-medium ${style.text} block`}>
                              {isError ? 'Erreur' : 'Succès'} #{error.id}
                            </span>
                            {error.fullname && (
                              <span className="text-xs text-gray-600 mt-1 block">
                                {error.fullname}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatDate(error.created_at)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className={`px-4 pb-4 pt-2 border-t ${style.border}`}>
                          {error.error_message && (
                            <div className="mt-2 p-3 bg-white rounded border border-red-100">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {error.error_message}
                              </p>
                            </div>
                          )}
                          {error.log_message && (
                            <div className="mt-2 p-3 bg-white rounded border border-green-100">
                              <p className="font-semibold text-xs text-green-700 mb-1">Logs:</p>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {error.log_message}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Autres erreurs */}
        {paginatedGroupedErrors.other.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Autres logs
                <Badge variant="secondary" className="ml-2">
                  {errors.other.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paginatedGroupedErrors.other.map((error) => {
                  const isExpanded = expandedErrors.has(error.id);
                  return (
                    <div
                      key={error.id}
                      className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleError(error.id)}
                        className="w-full p-4 flex items-start justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0" />
                          <div className="text-left">
                            <span className="font-medium text-gray-900 block">
                              Log #{error.id}
                            </span>
                            {error.fullname && (
                              <span className="text-xs text-gray-600 mt-1 block">
                                {error.fullname}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatDate(error.created_at)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                          {error.error_message && (
                            <div className="mt-2 p-3 bg-white rounded border border-gray-100">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {error.error_message}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages} ({allErrors.length} entrée{allErrors.length > 1 ? 's' : ''})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message si aucune erreur */}
        {totalErrors === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucun log
              </h3>
              <p className="text-gray-500">
                Aucune donnée à afficher.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}

