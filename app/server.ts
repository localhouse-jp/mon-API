import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { swaggerUI } from '@hono/swagger-ui'
import * as fs from 'fs'
import * as yaml from 'yaml'
import { app } from './app'
import { initData } from './lib/api'

// routes配下のファイルを自動的にロード
import './routes'

// OpenAPI ドキュメントを読み込み
const openApiDoc = yaml.parse(fs.readFileSync('./openapi.yaml', 'utf8'))

// Swagger UI の設定
app.get('/api-docs/*', swaggerUI({
  // urls の代わりに spec を使用
  spec: openApiDoc,
}))

// 静的ファイルの提供
// HonoXでは通常、静的ファイルはViteによってビルド時に処理されます
// 開発環境でも動作するよう、存在する場合のみ静的ファイルを提供
if (fs.existsSync('./public')) {
  app.use('/static/*', serveStatic({ root: './public' }))
}

const port = process.env.PORT || 3000

// サーバーの起動とデータ初期化を行う関数
async function startServer() {
  try {
    // データの初期化処理を実行し、待機する
    console.log('データ初期化を開始します...')
    await initData()
    console.log('データ初期化が完了しました')

    // サーバーを起動
    console.log(`サーバーを起動します：http://localhost:${port}`)
    serve({
      fetch: app.fetch,
      port: Number(port)
    })
  } catch (error) {
    console.error('サーバー起動中にエラーが発生しました:', error)
    process.exit(1)
  }
}

// サーバーを起動
startServer()