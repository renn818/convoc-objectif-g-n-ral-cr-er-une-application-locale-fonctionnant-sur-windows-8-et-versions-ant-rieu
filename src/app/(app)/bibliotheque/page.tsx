'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, Check, Download, Upload, FolderPlus, FileText, FolderOpen } from 'lucide-react';
import { ModeleResolution, CategorieModele } from '@/types';
import { getAllModeles, saveModele, deleteModele, getAllSessions } from '@/lib/db';
import { generateId, extractKeywords } from '@/lib/parser';

const CATEGORIES: CategorieModele[] = ['Travaux', 'Charges', 'Syndic', 'Assurances', 'Divers'];

const DEFAULT_MODELES: Record<CategorieModele, Partial<ModeleResolution>[]> = {
  Travaux: [
    {
      titre: 'Renouvellement du contrat de syndic',
      categorie: 'Syndic',
      motsCles: ['syndic', 'renouvellement', 'contrat', 'mandat'],
      contenu: 'Le mandat du syndic actuel arrivant à échéance, l\'assemblée générale decide de {sujet}.',
      modeleVote: { type: 'article_25', options: ['Pour', 'Contre', 'Abstention'] },
    },
  ],
  Charges: [
    {
      titre: 'Approbation du budget prévisionnel',
      categorie: 'Charges',
      motsCles: ['budget', 'prévisionnel', 'charges', 'approbation'],
      contenu: 'L\'assemblée générale, après avoir entendu le syndic, approuve le budget prévisionnel de l\'exercice.',
      modeleVote: { type: 'article_24', options: ['Pour', 'Contre', 'Abstention'] },
    },
  ],
  Syndic: [
    {
      titre: 'Nomination du syndic',
      categorie: 'Syndic',
      motsCles: ['syndic', 'nomination', 'mandat'],
      contenu: 'L\'assemblée générale décide de nommer {sujet} en qualité de syndic pour une durée de ...',
      modeleVote: { type: 'article_25', options: ['Pour', 'Contre', 'Abstention'] },
    },
  ],
  Assurances: [
    {
      titre: 'Renouvellement de l\'assurance dommages-ouvrages',
      categorie: 'Assurances',
      motsCles: ['assurance', 'dommages', 'ouvrages', 'renouvellement'],
      contenu: 'L\'assemblée générale décide de renouveler le contrat d\'assurance dommages-ouvrages.',
      modeleVote: { type: 'article_25', options: ['Pour', 'Contre', 'Abstention'] },
    },
  ],
  Divers: [],
};

export default function BibliothequePage() {
  const [modeles, setModeles] = useState<ModeleResolution[]>([]);
  const [selectedModele, setSelectedModele] = useState<ModeleResolution | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newModele, setNewModele] = useState<Partial<ModeleResolution>>({
    titre: '',
    categorie: 'Divers',
    motsCles: [],
    contenu: '',
    modeleVote: { type: 'article_24', options: ['Pour', 'Contre', 'Abstention'] },
  });

  useEffect(() => {
    loadModeles();
  }, []);

  async function loadModeles() {
    const all = await getAllModeles();
    setModeles(all);
    
    if (all.length === 0) {
      await initializeDefaultModeles();
    }
  }

  async function initializeDefaultModeles() {
    for (const cat of CATEGORIES) {
      const defaults = DEFAULT_MODELES[cat];
      for (const def of defaults) {
        const modele: ModeleResolution = {
          id: generateId(),
          titre: def.titre!,
          categorie: def.categorie!,
          motsCles: def.motsCles!,
          contenu: def.contenu!,
          modeleVote: def.modeleVote!,
        };
        await saveModele(modele);
      }
    }
    const all = await getAllModeles();
    setModeles(all);
  }

  async function handleSave() {
    if (!selectedModele) return;
    setSaving(true);
    setMessage(null);

    try {
      await saveModele(selectedModele as ModeleResolution);
      await loadModeles();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Modèle sauvegardé!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newModele.titre || !newModele.contenu) {
      setMessage({ type: 'error', text: 'Titre et contenu requis' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const modele: ModeleResolution = {
        id: generateId(),
        titre: newModele.titre,
        categorie: newModele.categorie || 'Divers',
        motsCles: newModele.motsCles || extractKeywords(newModele.titre + ' ' + newModele.contenu),
        contenu: newModele.contenu,
        modeleVote: newModele.modeleVote || { type: 'article_24', options: ['Pour', 'Contre', 'Abstention'] },
      };
      
      await saveModele(modele);
      await loadModeles();
      setNewModele({
        titre: '',
        categorie: 'Divers',
        motsCles: [],
        contenu: '',
        modeleVote: { type: 'article_24', options: ['Pour', 'Contre', 'Abstention'] },
      });
      setMessage({ type: 'success', text: 'Modèle créé!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle?')) return;
    
    try {
      await deleteModele(id);
      await loadModeles();
      if (selectedModele?.id === id) {
        setSelectedModele(null);
      }
      setMessage({ type: 'success', text: 'Modèle supprimé!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  }

  function exportLibrary() {
    const dataStr = JSON.stringify(modeles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliotheque_resolutions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importLibrary(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text) as ModeleResolution[];
      
      for (const m of imported) {
        m.id = generateId();
        await saveModele(m);
      }
      
      await loadModeles();
      setMessage({ type: 'success', text: `${imported.length} modèles importés!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'import' });
    }
  }

  const modelesByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = modeles.filter(m => m.categorie === cat);
    return acc;
  }, {} as Record<CategorieModele, ModeleResolution[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Bibliothèque de résolutions</h1>
        <p className="text-muted mt-2">Gérez vos modèles de résolutions réutilisables</p>
      </div>

      <div className="flex gap-4 mb-6">
        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
          <Upload size={20} />
          Importer
          <input type="file" accept=".json" onChange={importLibrary} className="hidden" />
        </label>
        <button onClick={exportLibrary} className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Exporter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Nouveau modèle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Titre</label>
                <input
                  type="text"
                  value={newModele.titre || ''}
                  onChange={(e) => setNewModele({ ...newModele, titre: e.target.value })}
                  className="input"
                  placeholder="Nom du modèle"
                />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select
                  value={newModele.categorie}
                  onChange={(e) => setNewModele({ ...newModele, categorie: e.target.value as CategorieModele })}
                  className="input"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Contenu</label>
                <textarea
                  value={newModele.contenu || ''}
                  onChange={(e) => setNewModele({ ...newModele, contenu: e.target.value })}
                  className="input h-24"
                  placeholder="Contenu de la résolution... Utilisez {sujet} pour remplacer automatiquement"
                />
              </div>
              <button onClick={handleCreate} disabled={saving} className="btn-primary w-full">
                {saving ? 'Création...' : 'Créer le modèle'}
              </button>
            </div>
          </div>

          {CATEGORIES.map(cat => (
            <div key={cat} className="card">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FolderOpen size={18} />
                {cat}
                <span className="text-sm text-muted ml-auto">({modelesByCategory[cat].length})</span>
              </h3>
              <div className="space-y-1">
                {modelesByCategory[cat].map(m => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedModele(m); setIsEditing(false); }}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedModele?.id === m.id ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate text-sm">{m.titre}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {modelesByCategory[cat].length === 0 && (
                  <p className="text-sm text-muted italic p-2">Aucun modèle</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedModele ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Détails du modèle</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
                    Modifier
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="label">Titre</label>
                    <input
                      type="text"
                      value={selectedModele.titre}
                      onChange={(e) => setSelectedModele({ ...selectedModele, titre: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Catégorie</label>
                    <select
                      value={selectedModele.categorie}
                      onChange={(e) => setSelectedModele({ ...selectedModele, categorie: e.target.value })}
                      className="input"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Mots-clés (séparés par virgules)</label>
                    <input
                      type="text"
                      value={selectedModele.motsCles.join(', ')}
                      onChange={(e) => setSelectedModele({ 
                        ...selectedModele, 
                        motsCles: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Contenu</label>
                    <textarea
                      value={selectedModele.contenu}
                      onChange={(e) => setSelectedModele({ ...selectedModele, contenu: e.target.value })}
                      className="input h-32"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                      <Save size={18} />
                      Sauvegarder
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Catégorie</label>
                      <p>{selectedModele.categorie}</p>
                    </div>
                    <div>
                      <label className="label">Type de vote</label>
                      <p>{selectedModele.modeleVote.type}</p>
                    </div>
                  </div>
                  <div>
                    <label className="label">Mots-clés</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedModele.motsCles.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Contenu</label>
                    <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded">{selectedModele.contenu}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-muted">Sélectionnez un modèle pour voir ses détails</p>
            </div>
          )}
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