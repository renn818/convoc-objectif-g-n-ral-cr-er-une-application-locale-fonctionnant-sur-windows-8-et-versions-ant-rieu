import { PointODJ, OrdreDuJour, Resolution, TypeVote, OPTIONS_VOTE_STANDARD, ModeleResolution } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseDocument(content: string): OrdreDuJour {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const keywords = [
    'ordre du jour', 'à l\'ordre du jour', 'sujet', 'point', 'discussion',
    'assemblée', 'convocation', 'agenda', 'sujets à traiter'
  ];
  
  let startIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (keywords.some(k => lower.includes(k))) {
      startIndex = i + 1;
      break;
    }
  }
  
  const points: PointODJ[] = [];
  let currentNumero = '';
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    const cleanedLine = line.replace(/^[•\-\–\—]+/, '').trim();
    
    const numeroMatch = cleanedLine.match(/^(\d+(?:\.\d+)?)\s*[\.\):]?\s*(.+)/);
    const bulletMatch = cleanedLine.match(/^([A-Z])\s*[\.\):]?\s*(.+)/);
    
    if (numeroMatch) {
      currentNumero = numeroMatch[1];
      points.push({
        id: generateId(),
        numero: currentNumero,
        titre: numeroMatch[2].trim(),
        sousPoints: [],
        motsCles: extractKeywords(numeroMatch[2]),
      });
    } else if (bulletMatch && points.length > 0 && bulletMatch[1].length === 1) {
      if (!points[points.length - 1].sousPoints) {
        points[points.length - 1].sousPoints = [];
      }
      points[points.length - 1].sousPoints!.push(bulletMatch[2]);
    } else if (currentNumero && line.length > 10 && !/^\d/.test(line)) {
      if (points.length > 0 && points[points.length - 1].sousPoints?.length === 0) {
        points[points.length - 1].titre += ' - ' + line;
        points[points.length - 1].motsCles = [
          ...(points[points.length - 1].motsCles || []),
          ...extractKeywords(line)
        ];
      }
    }
  }
  
  return {
    id: generateId(),
    titre: 'Ordre du jour',
    points,
    dateCreation: new Date(),
    contenuOriginal: content,
  };
}

export function extractKeywords(text: string): string[] {
  const stopWords = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'de la', 'de l\'',
    'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi',
    'à', 'au', 'aux', 'avec', 'sans', 'pour', 'par', 'sur', 'dans',
    'est', 'sont', 'sera', 'seront', 'été', 'était', 'étaient',
    'ce', 'cette', 'ces', 'cet', 'cette', 'mon', 'ma', 'mes', 'votre', 'nos',
    'nous', 'vous', 'ils', 'elles', 'il', 'elle', 'on',
    'se', 'son', 'sa', 'ses', 'leur', 'leurs',
    'plus', 'moins', 'très', 'bien', 'ainsi', 'aussi', 'encore',
    'peut', 'doit', 'faut', 'être', 'avoir', 'faire', 'pouvoir', 'vouloir'
  ];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w));
  
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 10);
}

export function determineTypeVote(point: PointODJ): TypeVote {
  const keywords = point.motsCles?.map(k => k.toLowerCase()) || [];
  
  const unanimiteKeywords = ['unanimité', 'unanimite', 'modification', 'statuts', 'règlement', 'travaux', 'grande majorité'];
  if (keywords.some(k => unanimiteKeywords.some(uk => k.includes(uk)))) {
    return 'unanimite';
  }
  
  const article26Keywords = ['travaux', 'création', 'suppression', 'emprunt', 'délai', 'isolation', 'ascenseur', 'accessibilité'];
  if (keywords.some(k => article26Keywords.some(ak => k.includes(ak)))) {
    return 'article_26';
  }
  
  const article25Keywords = ['budget', 'charges', 'contrat', 'syndic', 'assurance', 'nomination', 'gestion'];
  if (keywords.some(k => article25Keywords.some(ak => k.includes(ak)))) {
    return 'article_25';
  }
  
  return 'article_24';
}

export function generateResolution(point: PointODJ, modele?: ModeleResolution): Resolution {
  const typeVote = determineTypeVote(point);
  
  if (modele) {
    return {
      id: generateId(),
      numero: point.numero,
      titre: modele.titre,
      contenu: modele.contenu.replace('{sujet}', point.titre),
      typeVote: modele.modeleVote.type as TypeVote,
      optionsVote: modele.modeleVote.options,
      source: 'bibliotheque',
      pointODJId: point.id,
      dateCreation: new Date(),
    };
  }
  
  const defaultContents: Record<TypeVote, string> = {
    article_24: `L'assemblée générale, après avoir entendu lesyndic et délibéré, décide ${point.titre.toLowerCase()}.`,
    article_25: `L'assemblée générale, statuant à la majorité absolue des voix de tous les copropriétaires (article 25), décide ${point.titre.toLowerCase()}.`,
    article_26: `L'assemblée générale, statuant à la majorité des voix de tous les copropriétaires (article 26), décide ${point.titre.toLowerCase()}.`,
    unanimite: `L'assemblée générale, statuant à l'unanimité des copropriétaires, décide ${point.titre.toLowerCase()}.`,
  };
  
  return {
    id: generateId(),
    numero: point.numero,
    titre: point.titre,
    contenu: defaultContents[typeVote],
    typeVote,
    optionsVote: OPTIONS_VOTE_STANDARD,
    source: 'auto',
    pointODJId: point.id,
    dateCreation: new Date(),
  };
}

export function searchModeles(keywords: string[], modeles: ModeleResolution[]): ModeleResolution[] {
  const keywordLower = keywords.map(k => k.toLowerCase());
  
  return modeles
    .map(modele => {
      const modeleKeywords = modele.motsCles.map(k => k.toLowerCase());
      const matches = keywordLower.filter(k => 
        modeleKeywords.some(mk => mk.includes(k) || k.includes(mk))
      ).length;
      return { modele, matches };
    })
    .filter(item => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .map(item => item.modele);
}

export function validateResolution(resolution: Resolution): string[] {
  const errors: string[] = [];
  
  if (!resolution.numero) errors.push('Numéro manquant');
  if (!resolution.titre) errors.push('Titre manquant');
  if (!resolution.contenu) errors.push('Contenu manquant');
  if (resolution.optionsVote.length < 2) errors.push('Options de vote insuffisantes');
  
  return errors;
}

export function checkDuplicates(resolutions: Resolution[]): string[] {
  const warnings: string[] = [];
  const seen = new Set<string>();
  
  resolutions.forEach(r => {
    const key = r.titre.toLowerCase().trim();
    if (seen.has(key)) {
      warnings.push(`Résolution en double: ${r.numero}`);
    }
    seen.add(key);
  });
  
  return warnings;
}