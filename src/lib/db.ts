import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SessionData, ModeleResolution } from '@/types';

interface ConvocDB extends DBSchema {
  sessions: {
    key: string;
    value: SessionData;
    indexes: { 'by-date': Date };
  };
  modeles: {
    key: string;
    value: ModeleResolution;
    indexes: { 'by-categorie': string };
  };
  drafts: {
    key: string;
    value: SessionData;
  };
}

let db: IDBPDatabase<ConvocDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<ConvocDB>> {
  if (db) return db;
  
  db = await openDB<ConvocDB>('convoc-db', 1, {
    upgrade(database) {
      const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' });
      sessionStore.createIndex('by-date', 'dateCreation');
      
      const modeleStore = database.createObjectStore('modeles', { keyPath: 'id' });
      modeleStore.createIndex('by-categorie', 'categorie');
      
      database.createObjectStore('drafts', { keyPath: 'id' });
    },
  });
  
  return db;
}

export async function saveSession(session: SessionData): Promise<void> {
  const database = await initDB();
  await database.put('sessions', {
    ...session,
    dateModification: new Date(),
  });
}

export async function getSession(id: string): Promise<SessionData | undefined> {
  const database = await initDB();
  return database.get('sessions', id);
}

export async function getAllSessions(): Promise<SessionData[]> {
  const database = await initDB();
  return database.getAllFromIndex('sessions', 'by-date');
}

export async function deleteSession(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('sessions', id);
}

export async function saveModele(modele: ModeleResolution): Promise<void> {
  const database = await initDB();
  await database.put('modeles', modele);
}

export async function getModele(id: string): Promise<ModeleResolution | undefined> {
  const database = await initDB();
  return database.get('modeles', id);
}

export async function getAllModeles(): Promise<ModeleResolution[]> {
  const database = await initDB();
  return database.getAll('modeles');
}

export async function getModelesByCategorie(categorie: string): Promise<ModeleResolution[]> {
  const database = await initDB();
  return database.getAllFromIndex('modeles', 'by-categorie', categorie);
}

export async function deleteModele(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('modeles', id);
}

export async function saveDraft(draft: SessionData): Promise<void> {
  const database = await initDB();
  await database.put('drafts', draft);
}

export async function getDraft(id: string): Promise<SessionData | undefined> {
  const database = await initDB();
  return database.get('drafts', id);
}

export async function getAllDrafts(): Promise<SessionData[]> {
  const database = await initDB();
  return database.getAll('drafts');
}

export async function deleteDraft(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('drafts', id);
}