'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SessionData } from '@/types';
import { parseDocument } from '@/lib/parser';
import { saveSession } from '@/lib/db';

export default function ImportPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let content = '';
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'txt') {
        content = await file.text();
      } else if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import('pdfjs-dist');
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let content = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          content += pageText + '\n';
        }
        return content;
      } else if (ext === 'docx' || ext === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else {
        throw new Error('Format non supporté. Utilisez PDF, Word ou texte.');
      }

      if (!content.trim()) {
        throw new Error('Le document est vide ou illisible.');
      }

      const ordreDuJour = parseDocument(content);
      
      const session: SessionData = {
        id: Date.now().toString(36),
        titre: `Convocation - ${new Date().toLocaleDateString('fr-FR')}`,
        ordreDuJour,
        resolutions: [],
        dateCreation: new Date(),
        dateModification: new Date(),
      };

      await saveSession(session);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/ordre-du-jour');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement');
    } finally {
      setLoading(false);
    }
  }

  async function handleTextSubmit() {
    if (!textInput.trim()) {
      setError('Veuillez entrer du texte');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const ordreDuJour = parseDocument(textInput);
      
      const session: SessionData = {
        id: Date.now().toString(36),
        titre: `Convocation - ${new Date().toLocaleDateString('fr-FR')}`,
        ordreDuJour,
        resolutions: [],
        dateCreation: new Date(),
        dateModification: new Date(),
      };

      await saveSession(session);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/ordre-du-jour');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement');
    } finally {
      setLoading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Importer une convocation</h1>
        <p className="text-muted mt-2">Importez un document pour extraire automatiquement l&apos;ordre du jour</p>
      </div>

      <div
        className={`card border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center py-8">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-lg font-semibold mb-2">Glissez-déposez votre fichier ici</p>
          <p className="text-muted mb-4">ou cliquez pour sélectionner</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Traitement...' : 'Sélectionner un fichier'}
          </button>
          <p className="text-xs text-muted mt-4">Formats acceptés: PDF, Word (.doc, .docx), Texte (.txt)</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4 font-heading flex items-center gap-2">
          <FileText size={20} />
          Ou collez le texte directement
        </h2>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Collez ici le contenu de votre convocation..."
          className="input h-48"
        />
        <button
          onClick={handleTextSubmit}
          disabled={loading || !textInput.trim()}
          className="btn-secondary mt-4"
        >
          {loading ? 'Traitement...' : 'Extraire l\'ordre du jour'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
          <Check size={20} />
          Ordre du jour extrait avec succès! Redirection...
        </div>
      )}
    </div>
  );
}