export interface PointODJ {
  id: string;
  numero: string;
  titre: string;
  sousPoints?: string[];
  motsCles?: string[];
}

export interface OrdreDuJour {
  id: string;
  titre: string;
  points: PointODJ[];
  dateCreation: Date;
  contenuOriginal?: string;
}

export type TypeVote = 'article_24' | 'article_25' | 'article_26' | 'unanimite';

export interface Resolution {
  id: string;
  numero: string;
  titre: string;
  contenu: string;
  typeVote: TypeVote;
  optionsVote: string[];
  source: 'auto' | 'manuel' | 'bibliotheque';
  pointODJId?: string;
  dateCreation: Date;
}

export interface ModeleResolution {
  id: string;
  titre: string;
  categorie: string;
  motsCles: string[];
  contenu: string;
  modeleVote: {
    type: string;
    options: string[];
  };
}

export interface SessionData {
  id: string;
  titre: string;
  ordreDuJour: OrdreDuJour | null;
  resolutions: Resolution[];
  dateCreation: Date;
  dateModification: Date;
}

export type CategorieModele = 'Travaux' | 'Charges' | 'Syndic' | 'Assurances' | 'Divers';

export const OPTIONS_VOTE_STANDARD = ['Pour', 'Contre', 'Abstention'];

export const TYPE_VOTE_LABELS: Record<TypeVote, string> = {
  article_24: 'Majorité simple (art. 24)',
  article_25: 'Majorité absolue (art. 25)',
  article_26: 'Majorité renforcée (art. 26)',
  unanimite: 'Unanimité',
};

export const DEFAULT_CONTENT: Record<CategorieModele, string> = {
  Travaux: '',
  Charges: '',
  Syndic: '',
  Assurances: '',
  Divers: '',
};