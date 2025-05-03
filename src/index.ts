import { serve } from 'bun';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import apiRoutes, { initRoutes } from './api/routes';

// サーバー設定
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// メインアプリ
const app = new Hono();

// API ルートをマウント
app.route('/', apiRoutes);

// 静的ファイル
app.use('/static/*', serveStatic({ root: './public' }));

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

// APIルートを初期化（キャッシュ準備）
initRoutes();