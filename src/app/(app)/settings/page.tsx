'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Check, Wifi, WifiOff, Database, Trash2 } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getAllSessions, getAllModeles, getAllDrafts, deleteDraft, deleteSession } from '@/lib/db';

export default function SettingsPage() {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState({ sessions: 0, modeles: 0, drafts: 0 });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const sessions = await getAllSessions();
    const modeles = await getAllModeles();
    const drafts = await getAllDrafts();
    setStats({
      sessions: sessions.length,
      modeles: modeles.length,
      drafts: drafts.length,
    });
  }

  async function handleClearDrafts() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les brouillons?')) return;
    
    setClearing(true);
    try {
      const drafts = await getAllDrafts();
      for (const d of drafts) {
        await deleteDraft(d.id);
      }
      await loadStats();
      setMessage({ type: 'success', text: 'Brouillons supprimés!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setClearing(false);
    }
  }

  async function handleClearSessions() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les sessions? Cette action est irréversible.')) return;
    
    setClearing(true);
    try {
      const sessions = await getAllSessions();
      for (const s of sessions) {
        await deleteSession(s.id);
      }
      await loadStats();
      setMessage({ type: 'success', text: 'Sessions supprimées!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Paramètres</h1>
        <p className="text-muted mt-2">Configuration et gestion des données</p>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Wifi size={20} />
          État de connexion
        </h2>
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          isOnline ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-700">En ligne</p>
                <p className="text-sm text-green-600">Synchronisation disponible</p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="text-gray-600" size={24} />
              <div>
                <p className="font-semibold text-gray-700">Hors ligne</p>
                <p className="text-sm text-gray-500">Mode local uniquement</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Database size={20} />
          Stockage local
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Sessions sauvegardées</p>
              <p className="text-sm text-muted">Convocations traitées</p>
            </div>
            <span className="text-xl font-bold text-primary">{stats.sessions}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Modèles de résolutions</p>
              <p className="text-sm text-muted">Bibliothèque locale</p>
            </div>
            <span className="text-xl font-bold text-secondary">{stats.modeles}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Brouillons en cours</p>
              <p className="text-sm text-muted">Travail non finalisé</p>
            </div>
            <span className="text-xl font-bold text-accent">{stats.drafts}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">Gestion des données</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-semibold">Supprimer les brouillons</p>
              <p className="text-sm text-muted">Effacer tout le travail en cours</p>
            </div>
            <button 
              onClick={handleClearDrafts}
              disabled={clearing || stats.drafts === 0}
              className="btn-secondary flex items-center gap-2"
            >
              <Trash2 size={18} />
              {clearing ? '...' : 'Supprimer'}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <p className="font-semibold text-red-700">Supprimer toutes les sessions</p>
              <p className="text-sm text-muted">Action irréversible</p>
            </div>
            <button 
              onClick={handleClearSessions}
              disabled={clearing || stats.sessions === 0}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              {clearing ? '...' : 'Supprimer tout'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">À propos</h2>
        <div className="space-y-2 text-sm text-muted">
          <p><strong>CONVOC</strong> - Gestion de Convocation AG</p>
          <p>Version 1.0.0</p>
          <p>Application fonctionnant hors ligne pour Windows 8+</p>
          <p className="mt-4 text-xs">
            Cette application utilise IndexedDB pour le stockage local et fonctionne
            entièrement hors ligne. Aucune donnée n&apos;est envoyée vers des serveurs tiers.
          </p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}
    </div>
  );
}