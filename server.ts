import { Hono } from 'hono';
import { serve } from 'bun';
import { serveStatic } from 'hono/bun';
import { cache } from 'hono/cache';
import { KintetsuParser } from './parsers/kintetsu';
import * as fs from 'fs';
import * as path from 'path';

// 設定ファイルを読み込む関数
function loadConfig() {
  try {
    const configPath = './config.json';
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (err) {
    console.error('設定ファイルの読み込みに失敗しました:', err);
  }

  // デフォルト設定
  return {
    parsers: [
      {
        name: 'kintetsu',
        urls: [
          'https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=356-5&d=1&dw=0',
          'https://eki.kintetsu.co.jp/norikae/T5?USR=PC&slCode=350-8&d=1&dw=0'
        ]
      }
    ],
    outputDir: './dist'
  };
}

// 出力ディレクトリを確保
function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`ディレクトリを作成しました: ${dir}`);
  }
}

// データキャッシュ
interface CacheData {
  timestamp: number;
  data: any;
}

class DataCache {
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

// サーバー設定
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const CACHE_VALIDITY_MS = process.env.CACHE_VALIDITY_MS ? parseInt(process.env.CACHE_VALIDITY_MS) : 60 * 60 * 1000; // 1時間

// アプリケーション
const app = new Hono();
const dataCache = new DataCache(CACHE_VALIDITY_MS);
const config = loadConfig();
const outputDir = config.outputDir || './dist';
ensureDirectoryExists(outputDir);

// JRデータの取得
async function fetchJRData() {
  // jr.tsのロジックを使ってJRのデータを取得
  // この例では、ファイルから読み込む形式に変更
  try {
    const jrFilePath = path.join(outputDir, 'jr-train.json');
    if (!fs.existsSync(jrFilePath)) {
      console.log('JRデータファイルが見つかりません');
      return null;
    }
    const data = JSON.parse(fs.readFileSync(jrFilePath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('JRデータの読み込みに失敗しました:', error);
    return null;
  }
}

// 近鉄データの取得
async function fetchKintetsuData() {
  try {
    const kintetsuConfig = config.parsers.find(p => p.name.toLowerCase() === 'kintetsu');
    if (!kintetsuConfig) {
      console.log('近鉄の設定が見つかりません');
      return null;
    }

    const parser = new KintetsuParser();
    const result = await parser.parseUrls(kintetsuConfig.urls);
    
    // ファイルにも保存
    const outputPath = path.join(outputDir, 'kintetsu-train.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    
    return result;
  } catch (error) {
    console.error('近鉄データの取得に失敗しました:', error);
    // ファイルから読み込む
    try {
      const kintetsuFilePath = path.join(outputDir, 'kintetsu-train.json');
      if (fs.existsSync(kintetsuFilePath)) {
        const data = JSON.parse(fs.readFileSync(kintetsuFilePath, 'utf-8'));
        return data;
      }
    } catch (e) {
      console.error('近鉄のキャッシュファイルの読み込みにも失敗しました:', e);
    }
    return null;
  }
}

// キャッシュ付きミドルウェア
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.url} - ${end - start}ms`);
});

// 静的ファイル
app.use('/static/*', serveStatic({ root: './' }));

// APIルート - 近鉄データ
app.get('/api/kintetsu', cache({ cacheName: 'kintetsu-api', cacheControl: 'max-age=3600' }), async (c) => {
  const data = await dataCache.get('kintetsu', fetchKintetsuData);
  if (!data) {
    return c.json({ error: '近鉄のデータを取得できませんでした' }, 500);
  }
  return c.json(data);
});

// APIルート - JRデータ
app.get('/api/jr', cache({ cacheName: 'jr-api', cacheControl: 'max-age=3600' }), async (c) => {
  const data = await dataCache.get('jr', fetchJRData);
  if (!data) {
    return c.json({ error: 'JRのデータを取得できませんでした' }, 500);
  }
  return c.json(data);
});

// APIルート - すべてのデータ
app.get('/api/all', cache({ cacheName: 'all-api', cacheControl: 'max-age=3600' }), async (c) => {
  const [kintetsu, jr] = await Promise.all([
    dataCache.get('kintetsu', fetchKintetsuData),
    dataCache.get('jr', fetchJRData)
  ]);
  
  return c.json({
    kintetsu,
    jr,
    lastUpdated: new Date().toISOString()
  });
});

// キャッシュクリアエンドポイント（管理者用）
app.post('/api/cache/clear', async (c) => {
  const { key } = await c.req.json();
  if (key) {
    dataCache.clear(key);
    return c.json({ message: `キャッシュ "${key}" をクリアしました` });
  } else {
    dataCache.clear();
    return c.json({ message: 'すべてのキャッシュをクリアしました' });
  }
});

// フロントエンドのインデックスページ
app.get('/', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>鉄道時刻表API</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>鉄道時刻表API</h1>
      <p>以下のエンドポイントが利用可能です：</p>
      
      <div class="endpoint">
        <h3>GET /api/kintetsu</h3>
        <p>近鉄の時刻表データを取得します</p>
      </div>
      
      <div class="endpoint">
        <h3>GET /api/jr</h3>
        <p>JRの時刻表データを取得します</p>
      </div>
      
      <div class="endpoint">
        <h3>GET /api/all</h3>
        <p>すべての鉄道会社の時刻表データを取得します</p>
      </div>
      
      <p>データは1時間ごとに更新されます。</p>
    </body>
    </html>
  `);
});

// サーバー起動
console.log(`サーバーを起動します：http://localhost:${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT
});

// バックグラウンドでの定期的なデータ更新
// 起動時に一度取得してキャッシュを温める
setTimeout(() => {
  console.log('初期データを取得中...');
  Promise.all([
    dataCache.get('kintetsu', fetchKintetsuData),
    dataCache.get('jr', fetchJRData)
  ]).then(() => {
    console.log('初期データの取得が完了しました');
  }).catch(err => {
    console.error('初期データの取得中にエラーが発生しました:', err);
  });
}, 1000);