interface CacheData {
  timestamp: number;
  data: any;
}

export class DataCache {
  private cacheData: Record<string, CacheData> = {};
  private readonly cacheValidityMs: number;

  constructor(cacheValidityMs: number = 60 * 60 * 1000) {
    this.cacheValidityMs = cacheValidityMs;
  }

  async get(key: string, fetcher: () => Promise<any>): Promise<any> {
    const now = Date.now();
    const cached = this.cacheData[key];

    if (!cached || now - cached.timestamp > this.cacheValidityMs) {
      console.log(`キャッシュ無効または期限切れ: ${key}`);
      try {
        const data = await fetcher();
        this.cacheData[key] = {
          timestamp: now,
          data
        };
        return data;
      } catch (error) {
        if (cached) {
          console.warn(`データ取得エラー、古いキャッシュを使用: ${key}`, error);
          return cached.data;
        }
        throw error;
      }
    }

    console.log(`キャッシュヒット: ${key}`);
    return cached.data;
  }

  clear(key?: string): void {
    if (key) {
      delete this.cacheData[key];
    } else {
      this.cacheData = {};
    }
  }
}