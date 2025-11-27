"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function SoundCloudTestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/soundcloud/debug')
      .then(res => res.json())
      .then(data => {
        setDebugInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!debugInfo) {
    return <div className="p-8 text-red-500">Erreur lors du chargement</div>;
  }

  return (
    <div className="min-h-screen bg-secondary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-offwhite mb-6">Test OAuth SoundCloud</h1>
        
        <div className="bg-offwhite/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-offwhite mb-4">Configuration</h2>
          <div className="space-y-2 text-offwhite/80">
            <p><strong>Client ID:</strong> {debugInfo.clientId}</p>
            <p><strong>Redirect URI:</strong> {debugInfo.redirectUri}</p>
            <p><strong>Scope:</strong> {debugInfo.scope}</p>
            <p><strong>State:</strong> {debugInfo.state}</p>
          </div>
        </div>

        <div className="bg-offwhite/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-offwhite mb-4">URL SoundCloud</h2>
          <div className="bg-secondary/50 p-4 rounded mb-4 break-all text-offwhite/90 font-mono text-sm">
            {debugInfo.soundcloudUrl}
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(debugInfo.soundcloudUrl);
              toast.success('URL copiée !');
            }}
            className="mr-4"
          >
            Copier l'URL
          </Button>
          <Button
            onClick={() => {
              window.open(debugInfo.soundcloudUrl, '_blank');
            }}
            variant="outline"
          >
            Ouvrir dans un nouvel onglet
          </Button>
        </div>

        <div className="bg-offwhite/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-offwhite mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-offwhite/80">
            {debugInfo.instructions.map((instruction: string, index: number) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => {
              window.location.href = '/api/auth/soundcloud';
            }}
            className="bg-primary text-offwhite"
          >
            Tester la redirection automatique
          </Button>
        </div>
      </div>
    </div>
  );
}




