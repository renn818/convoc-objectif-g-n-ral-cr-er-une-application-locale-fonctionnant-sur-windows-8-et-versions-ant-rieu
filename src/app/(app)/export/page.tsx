'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, FileType, AlertCircle, Check, RefreshCw, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Resolution, TYPE_VOTE_LABELS } from '@/types';
import { getSession, getAllSessions, saveSession } from '@/lib/db';
import { exportToDocx, exportToTxt } from '@/lib/export';
import { validateResolution, checkDuplicates } from '@/lib/parser';

export default function ExportPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<{ id: string; titre: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const all = await getAllSessions();
    setSessions(all.map(s => ({ id: s.id, titre: s.titre || 'Sans titre' })));
    if (all.length > 0 && !selectedSessionId) {
      setSelectedSessionId(all[0].id);
      loadResolutions(all[0].id);
    }
  }

  async function loadResolutions(sessionId: string) {
    const session = await getSession(sessionId);
    if (session) {
      setResolutions(session.resolutions || []);
      setSessionTitle(session.titre || 'Projet de résolutions');
      
      const errors: string[] = [];
      session.resolutions?.forEach(r => {
        errors.push(...validateResolution(r));
      });
      setValidationErrors([...new Set(errors)]);
      
      if (session.resolutions) {
        setDuplicateWarnings(checkDuplicates(session.resolutions));
      }
    }
  }

  async function handleSessionChange(id: string) {
    setSelectedSessionId(id);
    setPreviewMode(false);
    await loadResolutions(id);
  }

  async function handleExportDocx() {
    if (resolutions.length === 0) {
      setMessage({ type: 'error', text: 'Aucune résolution à exporter' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const blob = await exportToDocx(sessionTitle, resolutions);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resolutions_${new Date().toISOString().split('T')[0]}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Document Word exporté avec succès!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'export Word' });
    } finally {
      setLoading(false);
    }
  }

  function handleExportTxt() {
    if (resolutions.length === 0) {
      setMessage({ type: 'error', text: 'Aucune résolution à exporter' });
      return;
    }
    
    const content = exportToTxt(sessionTitle, resolutions);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolutions_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Document texte exporté avec succès!' });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Exporter le document</h1>
        <p className="text-muted mt-2">Générez le document final avec toutes les résolutions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <p className="text-muted mb-4">Aucune session trouvée.</p>
          <button onClick={() => router.push('/import')} className="btn-primary">
            Importer une convocation
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <label className="label">Session à exporter</label>
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

          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={20} />
                Erreurs de validation ({validationErrors.length})
              </h3>
              <ul className="mt-2 list-disc list-inside text-red-600 text-sm">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {duplicateWarnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-700 flex items-center gap-2">
                <AlertCircle size={20} />
                Avertissements ({duplicateWarnings.length})
              </h3>
              <ul className="mt-2 list-disc list-inside text-yellow-700 text-sm">
                {duplicateWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Aperçu des résolutions ({resolutions.length})</h2>
              <button 
                onClick={() => setPreviewMode(!previewMode)}
                className="text-primary hover:underline text-sm flex items-center gap-1"
              >
                <Eye size={16} />
                {previewMode ? 'Masquer' : 'Afficher'} l&apos;aperçu
              </button>
            </div>
            
            {previewMode && resolutions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {resolutions.map((r, i) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-primary">N°{r.numero}</span>
                      <span className="font-semibold">{r.titre}</span>
                    </div>
                    <p className="text-sm text-muted mb-2">{r.contenu}</p>
                    <div className="text-xs text-gray-500">
                      <span>Vote: {TYPE_VOTE_LABELS[r.typeVote]}</span>
                      <span className="mx-2">•</span>
                      <span>Options: {r.optionsVote.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : previewMode ? (
              <p className="text-muted">Aucune résolution à afficher</p>
            ) : (
              <p className="text-muted">Cliquez sur &quot;Afficher l&apos;aperçu&quot; pour voir les résolutions</p>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleExportDocx}
              disabled={loading || resolutions.length === 0}
              className="btn-primary flex items-center gap-2"
            >
              <FileType size={20} />
              {loading ? 'Génération...' : 'Exporter en Word (.docx)'}
            </button>
            <button 
              onClick={handleExportTxt}
              disabled={resolutions.length === 0}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText size={20} />
              Exporter en texte (.txt)
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' :
              message.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
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