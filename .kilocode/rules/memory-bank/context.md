# Active Context: CONVOC - Gestion de Convocation AG

## Current State

**Application Status**: ✅ Build successful

CONVOC est une application de gestion de convocations d'assemblées générales pour copropriétés. Elle permet d'importer des documents, extraire l'ordre du jour, générer des résolutions et exporter en Word.

## Recently Completed

- [x] SPEC.md créé avec toutes les spécifications
- [x] Configuration Next.js 14 avec Tailwind CSS 3
- [x] Types TypeScript pour Résolution, SessionData, ModeleResolution
- [x] Module IndexedDB pour stockage local hors ligne
- [x] Parser pour extraction ordre du jour et génération résolutions
- [x] Export DOCX et TXT
- [x] UI complète avec 7 pages (Dashboard, Import, ODJ, Résolutions, Bibliothèque, Export, Paramètres)
- [x] Détection online/offline
- [x] Build réussi

## Structure du Projet

| Module | Fichier | Status |
|--------|---------|--------|
| Types | src/types/index.ts | ✅ |
| DB (IndexedDB) | src/lib/db.ts | ✅ |
| Parser | src/lib/parser.ts | ✅ |
| Export | src/lib/export.ts | ✅ |
| Import | src/app/(app)/import/page.tsx | ✅ |
| Ordre du jour | src/app/(app)/ordre-du-jour/page.tsx | ✅ |
| Résolutions | src/app/(app)/resolutions/page.tsx | ✅ |
| Bibliothèque | src/app/(app)/bibliotheque/page.tsx | ✅ |
| Export | src/app/(app)/export/page.tsx | ✅ |
| Paramètres | src/app/(app)/settings/page.tsx | ✅ |

## Fonctionnalités Implémentées

1. Import PDF, Word, TXT
2. Extraction automatique ordre du jour
3. Génération automatique résolutions (art. 24, 25, 26, unanimité)
4. Bibliothèque locale avec modèles
5. Export DOCX et TXT
6. Stockage IndexedDB (hors ligne)
7. Détection connexion Internet

## Session History

| Date | Changes |
|------|---------|
| 2026-03-26 | Création application CONVOC depuis spécifications |

## Prochaines Étapes

- [ ] Ajouter PWA/Service Worker pour fonctionnement offline complet
- [ ] Configuration next.config.js pour compatibilité navigateurs anciens
- [ ] Tester l'application en режим développement