/**
 * Simple in-memory cache for API responses
 * Reduces redundant network requests during navigation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 60 * 1000; // 1 minute default

  /**
   * Get cached data if still valid
   */
  get<T>(key: string, ttl = this.defaultTTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string, ttl = this.defaultTTL): boolean {
    return this.get(key, ttl) !== null;
  }

  /**
   * Clear a specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Invalidate all entries matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get or fetch: returns cached data or fetches and caches new data
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key, ttl);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Cache key generators for consistency
export const cacheKeys = {
  artists: (params?: Record<string, unknown>) => 
    `artists:${JSON.stringify(params || {})}`,
  artist: (id: string) => `artist:${id}`,
  artistAlbums: (id: string) => `artist:${id}:albums`,
  artistTracks: (id: string) => `artist:${id}:tracks`,
  
  albums: (params?: Record<string, unknown>) => 
    `albums:${JSON.stringify(params || {})}`,
  album: (id: string) => `album:${id}`,
  albumTracks: (id: string) => `album:${id}:tracks`,
  
  tracks: (params?: Record<string, unknown>) => 
    `tracks:${JSON.stringify(params || {})}`,
  track: (id: string) => `track:${id}`,
  
  playlists: () => `playlists`,
  playlist: (id: string) => `playlist:${id}`,
  playlistTracks: (id: string) => `playlist:${id}:tracks`,
  
  search: (query: string) => `search:${query}`,
};
