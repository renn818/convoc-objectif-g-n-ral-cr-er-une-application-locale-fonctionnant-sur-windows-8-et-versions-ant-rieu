'use client';

import Link from 'next/link';
import { FileText, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SessionData } from '@/types';
import { getAllSessions, getAllDrafts } from '@/lib/db';

export default function Dashboard() {
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const sessions = await getAllSessions();
    const drafts = await getAllDrafts();
    setRecentSessions(sessions.slice(-5).reverse());
    setDraftCount(drafts.length);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Dashboard</h1>
        <p className="text-muted mt-2">Bienvenue dans CONVOC - Gestion des Assemblées Générales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Importer un document</p>
              <Link href="/import" className="text-primary font-semibold hover:underline">
                Nouvelle convocation
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <FileText className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Sessions sauvegardées</p>
              <p className="text-xl font-bold">{recentSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Clock className="text-accent" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted">Brouillons en cours</p>
              <p className="text-xl font-bold">{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4 font-heading">Démarrage rapide</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary text-white rounded-full text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold">Importer une convocation</h3>
              <p className="text-sm text-muted">Glissez-déposez un fichier PDF, Word ou texte pour extraire l&apos;ordre du jour</p>
              <Link href="/import" className="text-primary text-sm hover:underline mt-2 inline-block">
                Aller à l&apos;import →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary text-white rounded-full text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold">Vérifier l&apos;ordre du jour</h3>
              <p className="text-sm text-muted">Modifiez, ajoutez ou supprimez des points de l&apos;ordre du jour</p>
              <Link href="/ordre-du-jour" className="text-primary text-sm hover:underline mt-2 inline-block">
                Voir l&apos;ordre du jour →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary text-white rounded-full text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold">Générer les résolutions</h3>
              <p className="text-sm text-muted">Créez automatiquement les projets de résolutions pour chaque point</p>
              <Link href="/resolutions" className="text-primary text-sm hover:underline mt-2 inline-block">
                Gérer les résolutions →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-primary text-white rounded-full text-sm font-bold">4</div>
            <div>
              <h3 className="font-semibold">Exporter le document</h3>
              <p className="text-sm text-muted">Générez le document final en Word, PDF ou texte</p>
              <Link href="/export" className="text-primary text-sm hover:underline mt-2 inline-block">
                Exporter →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 font-heading">Sessions récentes</h2>
          <div className="space-y-2">
            {recentSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{session.titre || 'Sans titre'}</p>
                  <p className="text-sm text-muted">
                    {session.resolutions.length} résolutions • {new Date(session.dateModification).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}