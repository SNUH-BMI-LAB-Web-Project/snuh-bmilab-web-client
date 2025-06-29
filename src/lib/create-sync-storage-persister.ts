import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client';

export function createSyncStoragePersister({
  storage = window.localStorage,
  key = 'REACT_QUERY_CACHE',
}: {
  storage?: Storage;
  key?: string;
} = {}): Persister {
  return {
    persistClient: (client: PersistedClient) => {
      storage.setItem(key, JSON.stringify(client));
    },
    restoreClient: () => {
      const cache = storage.getItem(key);
      return cache ? JSON.parse(cache) : null;
    },
    removeClient: () => {
      storage.removeItem(key);
    },
  };
}
