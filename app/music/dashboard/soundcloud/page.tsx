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
import { X } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface SoundCloudConfig {
  id: string;
  user_id: string;
  styles: string[];
  created_at: string;
  updated_at: string;
}

export default function SoundCloudConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
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

      await loadConfig();
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
      }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la configuration:', err);
      toast.error('Erreur lors du chargement de la configuration');
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

  const handleSave = async () => {
    if (styles.length === 0) {
      setError('Veuillez renseigner au moins un style');
      return;
    }

    if (styles.length > 3) {
      setError('Vous ne pouvez pas renseigner plus de 3 styles');
      return;
    }

    setSaving(true);
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
        toast.success('Configuration sauvegardée avec succès !');
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
      setSaving(false);
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
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-secondary">
            Configuration des automations SoundCloud
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce :</strong> Renseignez les styles musicaux qui vous définissent pour toucher un maximum de monde. 
              Vous pouvez renseigner jusqu'à 3 styles différents. Appuyez sur Entrée ou tapez une virgule pour ajouter un style.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/music/dashboard')}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saving || styles.length === 0 || styles.length > 3}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Dashboard>
  );
}

