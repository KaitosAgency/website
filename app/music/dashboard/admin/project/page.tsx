'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardWrapper as Dashboard } from '@/components/layout/dashboard-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Loader2, Save } from 'lucide-react';

export default function AdminProjectPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [musicUrl, setMusicUrl] = useState('');
    const [configId, setConfigId] = useState<string | null>(null);
    const { addToast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('music_admin')
                .select('id, music_url')
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Not found err is ok for now
                    console.error('Error loading config:', error);
                    addToast("Impossible de charger la configuration", "error");
                }
            }

            if (data) {
                setConfigId(data.id);
                setMusicUrl(data.music_url || '');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Nettoyer l'URL pour ne garder que le domaine
            let cleanDomain = musicUrl.trim();
            if (cleanDomain) {
                cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
                // Si l'utilisateur a collé une URL complète avec le path, on essaie de garder que le domaine
                if (cleanDomain.includes('/')) {
                    cleanDomain = cleanDomain.split('/')[0];
                }
                // Mettre à jour l'état local pour refléter ce qui va être sauvegardé
                setMusicUrl(cleanDomain);
            }

            const updateData = {
                music_url: cleanDomain,
            };

            let error;

            if (configId) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('music_admin')
                    .update(updateData)
                    .eq('id', configId);
                error = updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('music_admin')
                    .insert([updateData]);
                error = insertError;

                // Reload to get ID
                if (!insertError) {
                    loadConfig();
                }
            }

            if (error) throw error;

            addToast("Configuration mise à jour avec succès", "success");
        } catch (error: any) {
            console.error('Error saving config:', error);
            addToast(error.message || "Une erreur est survenue lors de la sauvegarde", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dashboard>
            <div className="space-y-6 max-w-4xl mx-auto p-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Paramètres du Projet</h2>
                    <p className="text-muted-foreground">
                        Configuration globale de l&apos;application.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Configuration du Domaine</CardTitle>
                        <CardDescription>
                            Définissez le nom de domaine principal pour les redirections OAuth.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="music-url">Nom de domaine du projet</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="music-url"
                                        placeholder="ex: kaitos.com"
                                        value={musicUrl}
                                        onChange={(e) => setMusicUrl(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Entrez simplement le nom de domaine (ex: <code>kaitos.com</code>).
                                    Il sera utilisé pour générer les URLs de redirection :<br />
                                    - SoundCloud: <code>https://[DOMAINE]/api/auth/soundcloud/callback</code><br />
                                    - Auth Google: <code>https://[DOMAINE]/auth/callback</code><br />
                                    Si vide, le système utilisera <code>localhost</code> ou la configuration par défaut.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleSave} disabled={loading || saving} className="ml-auto">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </Dashboard>
    );
}
