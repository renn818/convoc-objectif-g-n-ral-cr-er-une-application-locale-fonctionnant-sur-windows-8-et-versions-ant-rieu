# CONVOC - Spécifications Techniques

## 1. Project Overview

- **Name**: CONVOC
- **Type**: Progressive Web Application (PWA)
- **Core functionality**: Application de gestion de convocations d'assemblées générales pour copropriétés - import de documents, extraction d'ordre du jour, génération de résolutions, export professionnel
- **Target users**: Syndics de copropriété, gestionnaires de biens, propriétaires

## 2. Technical Architecture

### Stack
- **Framework**: Next.js 14 (compatible avec navigateurs anciens via compilation)
- **UI**: React + Tailwind CSS (avec fallbacks pour navigateurs anciens)
- **Parsing**: pdf-parse, mammoth (Word), text parsing natif
- **Export**: docx, jsPDF
- **Storage**: IndexedDB (offline) + localStorage
- **PWA**: Service Worker avec Workbox

### Compatibility
- Windows 8+ (IE11 mode), Windows 7, Vista, XP
- Navigateurs: Chrome 49+, Firefox 49+, Edge, Safari 9+
- Fonctionnement offline total

## 3. UI/UX Specification

### Color Palette
- Primary: `#1E3A5F` (bleu marine professionnel)
- Secondary: `#2E7D32` (vert copropriété)
- Accent: `#FF6F00` (orange action)
- Background: `#F5F5F5` (gris clair)
- Surface: `#FFFFFF`
- Text: `#212121`
- Muted: `#757575`
- Error: `#D32F2F`
- Success: `#388E3C`

### Typography
- Headings: "Libre Baskerville", serif (tradition juridique)
- Body: "Source Sans Pro", sans-serif
- Sizes: 12px (small), 14px (body), 16px (subtitle), 20px (title), 28px (h1)
- Line height: 1.5

### Layout Structure
- **Header**: Logo + navigation + status online/offline
- **Sidebar**: Menu de navigation (280px)
- **Main Content**: Zone de travail principale
- **Footer**: Actions principales + version

### Responsive
- Desktop: > 1024px
- Tablet: 768-1024px
- Mobile: < 768px

## 4. Module Specifications

### Module 1: Import & Parsing
- Upload drag-and-drop
- Support: PDF (.pdf), Word (.doc, .docx), TXT
- Extraction ordre du jour avec hiérarchie
- Nettoyage automatique
- Extraction mots-clés via NLP simple

### Module 2: Résolution Generator
- Templates par catégorie (art. 24, 25, 26, unanimité)
- Génération automatique basée sur mots-clés
- Édition manuelle intégrée
- Numérotation automatique

### Module 3: Bibliothèque
- Structure: /Travaux, /Charges, /Syndic, /Assurances, /Divers
- Format JSON avec recherche par mots-clés
- CRUD complet
- Import/export JSON

### Module 4: Export
- DOCX (principal)
- PDF (optionnel)
- TXT (basique)
- Vérifications: doublons, cohérences, numérotation

### Module 5: Offline/Sync
- Détection connexion automatique
- Sauvegarde automatique IndexedDB
- Synchronisation optionnelle (si online)

## 5. Page Structure

1. **Dashboard** (`/`) - Vue d'ensemble, import rapide
2. **Import** (`/import`) - Import de document
3. **Ordre du Jour** (`/ordre-du-jour`) - Édition ODJ
4. **Résolutions** (`/resolutions`) - Gestion résolutions
5. **Bibliothèque** (`/bibliotheque`) - Bibliothèque locale
6. **Export** (`/export`) - Génération document final
7. **Paramètres** (`/settings`) - Configuration

## 6. Data Models

### OrdreDuJour
```typescript
{
  id: string
  titre: string
  points: PointODJ[]
  dateCreation: Date
}

PointODJ {
  numero: string
  titre: string
  sousPoints?: string[]
  motsCles?: string[]
}
```

### Resolution
```typescript
{
  id: string
  numero: string
  titre: string
  contenu: string
  typeVote: 'article_24' | 'article_25' | 'article_26' | 'unanimite'
  optionsVote: string[]
  source?: 'auto' | 'manuel' | 'bibliotheque'
  pointODJId?: string
}
```

### ModeleResolution
```typescript
{
  id: string
  titre: string
  categorie: string
  motsCles: string[]
  contenu: string
  modeleVote: {
    type: string
    options: string[]
  }
}
```

## 7. Acceptance Criteria

- [ ] Import PDF, Word, TXT fonctionnel
- [ ] Extraction ordre du jour automatique
- [ ] Génération résolutions par point ODJ
- [ ] Bibliothèque locale avec recherche
- [ ] Export DOCX complet
- [ ] Fonctionnement offline vérifié
- [ ] Détection online/offline
- [ ] Compatible IE11 / Windows 8
- [ ] UI professionnelle et cohérente