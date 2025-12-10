"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Dashboard } from "@/components/layout/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "@/components/ui/toast";
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle, RefreshCw, List } from "lucide-react";

interface LogEntry {
  id: number;
  created_at: string;
  user_id: string | null;
  fullname: string | null;
  platform: string;
  error_message: string | null;
  log_message: string | null;
  type: string | null;
}

type TabType = 'all' | 'errors' | 'success' | 'refresh';

export default function AdminLogsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshAdminStatus, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
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

  const checkAdminAndLoad = async () => {
    try {
      if (!user) {
        const isAuthenticated = await checkAuth('/music/dashboard/admin/logs');
        if (!isAuthenticated) {
          return;
        }
        return;
      }

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
      await refreshAdminStatus();
      await loadLogs();
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur de vérification de l\'authentification');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/user/logs');
      if (response.ok) {
        const data = await response.json();
        const flatLogs = [
          ...(data.errors?.soundcloud || []),
          ...(data.errors?.other || [])
        ];
        setLogs(flatLogs);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des logs');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des logs:', err);
      setError('Erreur lors du chargement des logs');
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

  // Filtrer les logs selon l'onglet actif
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    if (activeTab === 'errors') {
      return log.type === 'error' || log.type === null;
    }
    if (activeTab === 'success') {
      return log.type === 'workflow_success';
    }
    if (activeTab === 'refresh') {
      return log.type === 'refresh_token';
    }
    return false;
  }).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculer la pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Helper pour obtenir le style selon le type de log
  const getLogStyle = (log: LogEntry) => {
    const logType = log.type;
    if (logType === 'error' || logType === null) {
      return { iconColor: 'text-red-600', iconBg: 'bg-red-100', text: 'text-red-900' };
    }
    if (logType === 'workflow_success') {
      return { iconColor: 'text-green-600', iconBg: 'bg-green-100', text: 'text-green-900' };
    }
    if (logType === 'refresh_token') {
      return { iconColor: 'text-blue-600', iconBg: 'bg-blue-100', text: 'text-blue-900' };
    }
    return { iconColor: 'text-gray-600', iconBg: 'bg-gray-100', text: 'text-gray-900' };
  };

  // Helper pour obtenir l'icône selon le type de log
  const getLogIcon = (log: LogEntry) => {
    const logType = log.type;
    const style = getLogStyle(log);
    if (logType === 'error' || logType === null) {
      return <AlertCircle className={`h-5 w-5 ${style.iconColor}`} />;
    }
    if (logType === 'workflow_success') {
      return <CheckCircle className={`h-5 w-5 ${style.iconColor}`} />;
    }
    if (logType === 'refresh_token') {
      return <RefreshCw className={`h-5 w-5 ${style.iconColor}`} />;
    }
    return <List className={`h-5 w-5 ${style.iconColor}`} />;
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

  return (
    <Dashboard title="Logs">
      <div className="w-full space-y-6">
        {/* Filtres */}
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <List className="h-3.5 w-3.5" />
            Tout
          </button>
          <button
            onClick={() => { setActiveTab('errors'); setCurrentPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'errors'
              ? 'bg-white text-red-700 shadow-sm'
              : 'text-gray-500 hover:text-red-600'
              }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Erreurs
          </button>
          <button
            onClick={() => { setActiveTab('success'); setCurrentPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'success'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-green-600'
              }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Succès Workflow
          </button>
          <button
            onClick={() => { setActiveTab('refresh'); setCurrentPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'refresh'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-blue-600'
              }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Token
          </button>
        </div>

        {/* En-tête avec statistiques */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                  {activeTab === 'all' && 'Tous les logs'}
                  {activeTab === 'errors' && 'Erreurs N8N'}
                  {activeTab === 'success' && 'Succès Workflow'}
                  {activeTab === 'refresh' && 'Logs Refresh Token'}
                </h2>
                <p className="text-gray-600">
                  {filteredLogs.length === 0
                    ? "Aucun log enregistré dans cette catégorie"
                    : `${filteredLogs.length} entrée${filteredLogs.length > 1 ? 's' : ''} enregistrée${filteredLogs.length > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              {filteredLogs.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {filteredLogs.length}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Liste des logs */}
        {paginatedLogs.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {paginatedLogs.map((log) => {
                  const style = getLogStyle(log);

                  return (
                    <div
                      key={log.id}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${style.iconBg} flex-shrink-0`}>
                        {getLogIcon(log)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${style.text}`}>
                            #{log.id}
                          </span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {log.platform === 'soundcloud' ? 'SoundCloud' : 'Autre'}
                          </Badge>
                          {log.fullname && (
                            <span className="text-xs text-gray-500">
                              • {log.fullname}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {log.error_message || log.log_message || "Aucun détail"}
                        </div>
                      </div>

                      <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatDate(log.created_at)}
                      </span>
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
                  Page {currentPage} sur {totalPages} ({filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''})
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (totalPages > 10 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                        if (Math.abs(page - currentPage) === 3) return <span key={page} className="px-1 text-gray-400">...</span>;
                        return null;
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[2.5rem]"
                        >
                          {page}
                        </Button>
                      )
                    })}
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

        {/* Message si aucun log dans la catégorie */}
        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              {activeTab === 'errors' ? (
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              ) : activeTab === 'success' ? (
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              ) : activeTab === 'refresh' ? (
                <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              ) : (
                <List className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucun log
              </h3>
              <p className="text-gray-500">
                Aucune donnée à afficher pour cette catégorie.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}

