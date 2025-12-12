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
import { useAuth } from "@/lib/contexts/auth-context";


export default function AdminSoundCloudConfigPage() {
  const router = useRouter();
  const { user, isAdmin: contextIsAdmin, loading: authLoading, refreshAdminStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [defaultComments, setDefaultComments] = useState<string[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [savingComments, setSavingComments] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  // Vérifier le rôle admin à chaque accès à la page (comme demandé)
  const checkAdminAndLoad = async () => {
    try {
      // Vérifier l'authentification d'abord
      if (!user) {
        router.push('/auth/login?redirect=/music/dashboard/admin/soundcloud-config');
        return;
      }

      // Toujours vérifier le rôle admin à chaque accès (sécurité)
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('type')
        .eq('id', user.id)
        .single();

      if (error || profile?.type !== 'ADMIN') {
        toast.error('Accès refusé. Vous devez être administrateur.');
        router.push('/music/dashboard');
        return;
      }

      setIsAdmin(true);
      // Mettre à jour le contexte aussi
      await refreshAdminStatus();
      await loadDefaultComments();
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur de vérification de l\'authentification');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultComments = async () => {
    setLoadingComments(true);
    try {
      const supabase = createClient();

      // On n'a plus besoin du user ici car la table est globale, 
      // mais l'accès est protégé par RLS (seuls les admins peuvent lire)

      const { data, error } = await supabase
        .from('music_admin')
        .select('default_comments')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
        return;
      }

      if (data?.default_comments && Array.isArray(data.default_comments) && data.default_comments.length > 0) {
        setDefaultComments(data.default_comments as string[]);
      } else {
        // Si aucun commentaire, utiliser la liste par défaut
        // La liste initiale est définie plus bas, on pourrait la sortir du composant pour être plus propre
        const initialComments = [
          "🌶 pépite", "❤️🔥", "💙🔥", "🔥", "🔊", "🎼", "Cool 💙", "❤️❤️❤️🔥", "Amaaaaazing 🤯", "Incroyable merci !!",
          "🤯🤯", "yaaay", "🔊🔊🔊🔊", "😍", "❤️🌞", "😍🤤", "Merci ❤️", "Lourdeur", "🔥🔥", "🎧💙", "💪💪💪",
          "what a vibe :)", "❤️🔥❤️🔥❤️🔥❤️", "❤️", "don't stop plz <3", "waouh 😍🤯", "💣🔥💥", "🔊🔊🔊🔊🔊🔊🔊🔊",
          "I love this 😍", "c'est ça qu'on veux !", "i love it ❤️", "Wow", "🙏🏻🙏🏻🙏🏻🙏🏻🔥🔥🔥🔥🔥", "Pure energie 🔥",
          "😍😍😍😍", "sick asf", "❤️‍🔥", "😍🔥", "🤯🤯🤯", "Ahhhhhhh❤️❤️❤️❤️❤️", "YEEHAW", "Mamaaaaaaa",
          "waaaaaaaaaaa", "j'aiiiiiiiiiime", "❤️‍🔥💥", "bruh", "incrrr", "💓", "!!", "incr", "🤩😍", "❤❤❤",
          "💜🙏", "🛫🛫🔊😍", "❤️👌👌👌👌😍😍😍", "parfait !", "❤️❤️", "Bon dieux c'est lourd !", "Top ! Bravo l'artiste !",
          "malade", "❤️🔊🔊🔊", "Respect mec 🏴‍☠️🔊🤩", "coooool :)", "Du kifffff", "dopee", "BOH 🦾🦾🦾🦾", "<3",
          "!!!!!!!!!!!", "nice", "amazing!!", ":°", "wowww", "nice track", "nice guys", "ouuuuuuh", "Yoooo",
          "banger", "fat", "🔥🔥🔥", "Insane", "🔥🔥", "Nice!", "!!!", "boomb", "YESSSSSSSSSSSSSSS", "woow 😍😱😤"
        ];
        setDefaultComments(initialComments);

        // Si aucune donnée n'existe, on essaie de créer l'entrée singleton
        if (!data) {
          await saveDefaultComments(initialComments);
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const saveDefaultComments = async (comments: string[]) => {
    setSavingComments(true);
    try {
      const supabase = createClient();

      // Vérifier si l'entrée singleton existe
      const { data: adminEntry } = await supabase
        .from('music_admin')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (adminEntry) {
        // Mettre à jour l'entrée existante
        const { error } = await supabase
          .from('music_admin')
          .update({ default_comments: comments })
          .eq('id', adminEntry.id);

        if (error) throw error;
      } else {
        // Créer la nouvelle entrée singleton (sans user_id)
        const { error } = await supabase
          .from('music_admin')
          .insert({ default_comments: comments });

        if (error) throw error;
      }

      setDefaultComments(comments);
      setHasChanges(false);
      toast.success('Commentaires sauvegardés avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      toast.error('Erreur lors de la sauvegarde des commentaires');
    } finally {
      setSavingComments(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Veuillez entrer un commentaire');
      return;
    }

    if (defaultComments.includes(newComment.trim())) {
      toast.error('Ce commentaire existe déjà');
      return;
    }

    const updatedComments = [...defaultComments, newComment.trim()];
    setDefaultComments(updatedComments);
    setHasChanges(true);
    setNewComment('');
  };

  const handleRemoveComment = (comment: string) => {
    const updatedComments = defaultComments.filter(c => c !== comment);
    setDefaultComments(updatedComments);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveDefaultComments(defaultComments);
  };

  if (loading) {
    return (
      <Dashboard title="Configuration SoundCloud - Admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </Dashboard>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Dashboard title="Configuration SoundCloud - Admin">
      <div className="w-full space-y-6">
        {/* Card pour gérer les commentaires par défaut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-secondary">
              Commentaires par défaut
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-comment" className="text-sm font-medium text-gray-700">
                Ajouter un commentaire
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-comment"
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
                />
                <Button
                  onClick={handleAddComment}
                  variant="outline"
                  disabled={!newComment.trim()}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {loadingComments ? (
              <p className="text-gray-500 text-sm">Chargement des commentaires...</p>
            ) : (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Commentaires ({defaultComments.length})
                    </Label>
                  </div>

                  {defaultComments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun commentaire défini.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {defaultComments.map((comment, index) => (
                        <Badge
                          key={index}
                          variant="default"
                          className="group cursor-pointer hover:bg-gray-700 hover:text-white transition-all duration-200"
                          onClick={() => handleRemoveComment(comment)}
                        >
                          <span>{comment}</span>
                          <span className="w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-200 flex items-center justify-end">
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {hasChanges && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={savingComments}>
                  {savingComments ? 'Sauvegarde...' : 'Enregistrer'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}

