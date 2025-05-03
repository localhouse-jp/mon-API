import { swaggerUI } from '@hono/swagger-ui';
import { serve } from 'bun';
import * as fs from 'fs';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import * as yaml from 'yaml';
import apiRoutes, { initRoutes } from './api/routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Hono();

app.route('/', apiRoutes);

app.use('/static/*', serveStatic({ root: './public' }));

// OpenAPI ドキュメントを読み込み
const openApiDoc = yaml.parse(fs.readFileSync('./openapi.yaml', 'utf8'));

// Swagger UI の設定
app.get('/api-docs/*', swaggerUI({ spec: openApiDoc }));

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
        .docs-link { margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; 
                     text-decoration: none; display: inline-block; border-radius: 4px; }
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

      <a href="/api-docs" class="docs-link">API ドキュメントを表示</a>
    </body>
    </html>
  `);
});

console.log(`サーバーを起動します：http://localhost:${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT
});

initRoutes();