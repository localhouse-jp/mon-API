// データキャッシュ
interface CacheData {
  timestamp: number;
  data: any;
}

/**
 * メモリ内データキャッシュクラス
 */
export class DataCache {
  private cacheData: Record<string, CacheData> = {};
  private readonly cacheValidityMs: number;

  constructor(cacheValidityMs: number = 60 * 60 * 1000) { // デフォルトは1時間
    this.cacheValidityMs = cacheValidityMs;
  }

  async get(key: string, fetcher: () => Promise<any>): Promise<any> {
    const now = Date.now();
    const cached = this.cacheData[key];

    // キャッシュがない、または有効期限切れの場合は再取得
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
        // エラーが発生したが、古いキャッシュがある場合は古いデータを返す
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