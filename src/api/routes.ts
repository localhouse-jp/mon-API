import * as fs from 'fs';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import * as path from 'path';
import { parseJR } from '../parsers/jr';
import { KintetsuParser } from '../parsers/kintetsu';
import { DataCache } from '../utils/cache';
import { ensureDirectoryExists, loadConfig } from '../utils/config';

const app = new Hono();
const config = loadConfig();
const outputDir = config.outputDir || './dist';
ensureDirectoryExists(outputDir);

// メモリ内キャッシュ（1時間有効）
const CACHE_VALIDITY_MS = process.env.CACHE_VALIDITY_MS ? parseInt(process.env.CACHE_VALIDITY_MS) : 60 * 60 * 1000;
const dataCache = new DataCache(CACHE_VALIDITY_MS);

// JRデータの取得
async function fetchJRData() {
  try {
    return await parseJR();
  } catch (error) {
    console.error('JRデータの取得に失敗しました:', error);
    // ファイルから読み込む
    try {
      const jrFilePath = path.join(outputDir, 'jr-train.json');
      if (fs.existsSync(jrFilePath)) {
        const data = JSON.parse(fs.readFileSync(jrFilePath, 'utf-8'));
        return data;
      }
    } catch (e) {
      console.error('JRのキャッシュファイルの読み込みにも失敗しました:', e);
    }
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

// ルートの初期化機能
export function initRoutes() {
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
}

export default app;