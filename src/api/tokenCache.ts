import type { Cacheable, ICache } from '@auth0/auth0-react';
import { Preferences } from '@capacitor/preferences';

const PREFIX = 'fya.auth0.';

export const tokenCache: ICache = {
  async get<T = Cacheable>(key: string): Promise<T | undefined> {
    const { value } = await Preferences.get({ key: PREFIX + key });
    return value ? (JSON.parse(value) as T) : undefined;
  },

  async set<T = Cacheable>(key: string, entry: T): Promise<void> {
    await Preferences.set({ key: PREFIX + key, value: JSON.stringify(entry) });
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key: PREFIX + key });
  },

  async allKeys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys.filter((key) => key.startsWith(PREFIX)).map((key) => key.slice(PREFIX.length));
  },
};
