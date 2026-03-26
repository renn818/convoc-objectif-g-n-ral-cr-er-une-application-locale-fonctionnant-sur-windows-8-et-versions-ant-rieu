'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PointODJ } from '@/types';
import { getSession, saveSession, getAllSessions } from '@/lib/db';
import { generateId } from '@/lib/parser';

export default function OrdreDuJourPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<{ id: string; titre: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [points, setPoints] = useState<PointODJ[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const all = await getAllSessions();
    setSessions(all.map(s => ({ id: s.id, titre: s.titre || 'Sans titre' })));
    if (all.length > 0 && !selectedSessionId) {
      setSelectedSessionId(all[0].id);
      loadPoints(all[0].id);
    }
  }

  async function loadPoints(sessionId: string) {
    const session = await getSession(sessionId);
    if (session?.ordreDuJour) {
      setPoints(session.ordreDuJour.points);
    } else {
      setPoints([]);
    }
  }

  async function handleSessionChange(id: string) {
    setSelectedSessionId(id);
    await loadPoints(id);
  }

  async function handleSave() {
    if (!selectedSessionId) return;
    setSaving(true);
    setMessage(null);

    try {
      const session = await getSession(selectedSessionId);
      if (session) {
        session.ordreDuJour!.points = points;
        session.dateModification = new Date();
        await saveSession(session);
        setMessage({ type: 'success', text: 'Ordre du jour sauvegardé!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  }

  function addPoint() {
    const newPoint: PointODJ = {
      id: generateId(),
      numero: (points.length + 1).toString(),
      titre: 'Nouveau point',
      sousPoints: [],
      motsCles: [],
    };
    setPoints([...points, newPoint]);
  }

  function updatePoint(id: string, field: keyof PointODJ, value: unknown) {
    setPoints(points.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  }

  function deletePoint(id: string) {
    setPoints(points.filter(p => p.id !== id));
  }

  function renumberPoints() {
    setPoints(points.map((p, i) => ({
      ...p,
      numero: (i + 1).toString(),
    })));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Ordre du jour</h1>
        <p className="text-muted mt-2">Modifiez les points de l&apos;ordre du jour</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <p className="text-muted mb-4">Aucune session trouvée. Importez d&apos;abord une convocation.</p>
          <button onClick={() => router.push('/import')} className="btn-primary">
            Importer une convocation
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <label className="label">Session</label>
            <select 
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="input"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.titre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {points.map((point, index) => (
              <div key={point.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-20 flex-shrink-0">
                    <label className="label">Numéro</label>
                    <input
                      type="text"
                      value={point.numero}
                      onChange={(e) => updatePoint(point.id, 'numero', e.target.value)}
                      className="input text-center font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="label">Titre du point</label>
                    <input
                      type="text"
                      value={point.titre}
                      onChange={(e) => updatePoint(point.id, 'titre', e.target.value)}
                      className="input"
                    />
                  </div>
                  <button
                    onClick={() => deletePoint(point.id)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {point.sousPoints && point.sousPoints.length > 0 && (
                  <div className="mt-4 ml-24 space-y-2">
                    <label className="label">Sous-points</label>
                    {point.sousPoints.map((sp, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted">•</span>
                        <span>{sp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={addPoint} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Ajouter un point
            </button>
            <button onClick={renumberPoints} className="btn-secondary">
              Renuméroter
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-accent flex items-center gap-2">
              <Save size={20} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}
        </>
      )}
    </div>
  );
}