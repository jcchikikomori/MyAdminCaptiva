import { FileStorageProvider } from './file';
import { MemoryStorageProvider } from './memory';
import { CouchDbStorageProvider } from './couchdb';
import type { StorageProvider } from './types';
import { initialUsers } from '@/lib/data';

export function getStorage(): StorageProvider {
  const provider = (process.env.STORAGE_PROVIDER || 'memory').toLowerCase();
  switch (provider) {
    case 'file':
      return new FileStorageProvider();
    case 'couchdb':
      return new CouchDbStorageProvider();
    case 'memory':
    default:
      return new MemoryStorageProvider(initialUsers);
  }
}

export type { StorageProvider } from './types';
export type { User } from './types';

