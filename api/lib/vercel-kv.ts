export interface KvClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
  mget<T>(...keys: string[]): Promise<(T | null)[]>;
  scanIterator(options?: { match?: string; count?: number }): AsyncIterable<string>;
}

interface MemoryEntry {
  value: unknown;
  expiresAt: number | null;
}

const memoryStore = new Map<string, MemoryEntry>();
let missingPackageWarningShown = false;
let resolvedKvPromise: Promise<KvClient> | null = null;

function cleanupExpiredMemoryEntries(): void {
  const now = Date.now();

  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt !== null && entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

function matchesPattern(value: string, pattern: string | undefined): boolean {
  if (!pattern) {
    return true;
  }

  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(value);
}

const memoryKv: KvClient = {
  async get<T>(key: string): Promise<T | null> {
    cleanupExpiredMemoryEntries();
    const entry = memoryStore.get(key);
    return (entry?.value as T | undefined) ?? null;
  },

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown> {
    memoryStore.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + (options.ex * 1000) : null,
    });
    return 'OK';
  },

  async del(key: string): Promise<unknown> {
    memoryStore.delete(key);
    return 1;
  },

  async mget<T>(...keys: string[]): Promise<(T | null)[]> {
    cleanupExpiredMemoryEntries();
    return keys.map((key) => {
      const entry = memoryStore.get(key);
      return (entry?.value as T | undefined) ?? null;
    });
  },

  async *scanIterator(options?: { match?: string; count?: number }): AsyncIterable<string> {
    cleanupExpiredMemoryEntries();

    for (const key of memoryStore.keys()) {
      if (matchesPattern(key, options?.match)) {
        yield key;
      }
    }
  },
};

async function getResolvedKv(): Promise<KvClient> {
  if (!resolvedKvPromise) {
    resolvedKvPromise = import('@vercel/kv')
      .then((module) => module.kv as unknown as KvClient)
      .catch(() => {
        if (!missingPackageWarningShown) {
          missingPackageWarningShown = true;
          console.warn('[KV] @vercel/kv not installed; falling back to in-memory KV for local development.');
        }

        return memoryKv;
      });
  }

  return resolvedKvPromise;
}

export const kv: KvClient = {
  async get<T>(key: string): Promise<T | null> {
    return (await getResolvedKv()).get<T>(key);
  },

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<unknown> {
    return (await getResolvedKv()).set(key, value, options);
  },

  async del(key: string): Promise<unknown> {
    return (await getResolvedKv()).del(key);
  },

  async mget<T>(...keys: string[]): Promise<(T | null)[]> {
    return (await getResolvedKv()).mget<T>(...keys);
  },

  scanIterator(options?: { match?: string; count?: number }): AsyncIterable<string> {
    return {
      [Symbol.asyncIterator]: async function* () {
        const resolvedKv = await getResolvedKv();
        for await (const key of resolvedKv.scanIterator(options)) {
          yield key;
        }
      },
    };
  },
};

export async function setKvWithTtl(
  key: string,
  ttlSeconds: number,
  value: unknown
): Promise<void> {
  await kv.set(key, value, { ex: ttlSeconds });
}

export async function listKvKeys(match: string): Promise<string[]> {
  const keys: string[] = [];

  for await (const key of kv.scanIterator({ match })) {
    keys.push(key);
  }

  return keys;
}
