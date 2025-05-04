import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { DataCache } from './lib/utils/cache'
import { ensureDirectoryExists, loadConfig } from './lib/utils/config'

// 型定義
declare global {
  var app: Hono
}

// デバッグモードの設定
const DEBUG_MODE = process.env.DEBUG_MODE === 'true'

// 設定の読み込み
const config = loadConfig()
const outputDir = config.outputDir || './dist'
ensureDirectoryExists(outputDir)

// キャッシュの設定
const CACHE_VALIDITY_MS = process.env.CACHE_VALIDITY_MS
  ? parseInt(process.env.CACHE_VALIDITY_MS)
  : 60 * 60 * 1000

const dataCache = new DataCache(CACHE_VALIDITY_MS)

// HonoXアプリケーション
export const app = new Hono()

// ミドルウェア
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}))

// ロギングミドルウェア
app.use('*', logger())

// Content-Typeを適切に設定するミドルウェア
app.use('*', async (c, next) => {
  await next()
  if (!c.res.headers.has('Content-Type')) {
    c.header('Content-Type', 'text/html; charset=UTF-8')
  }
})

// インデックスルートを直接登録
import IndexRoute from './routes/index'
app.get('/', (c) => {
  return c.html(IndexRoute())
})

// ビューエンドポイントを直接登録
import KintetsuBusCalendarView from './routes/view/kintetsu-bus/calendar/index'
import KintetsuBusView from './routes/view/kintetsu-bus/index'

app.get('/view/kintetsu-bus', (c) => {
  return c.html(KintetsuBusView())
})

app.get('/view/kintetsu-bus/calendar', (c) => {
  return c.html(KintetsuBusCalendarView())
})

// APIエンドポイントの登録
import * as apiAll from './routes/api/all'
import * as apiCacheClear from './routes/api/cache/clear'
import * as apiJr from './routes/api/jr'
import * as apiKintetsu from './routes/api/kintetsu'
import * as apiKintetsuBus from './routes/api/kintetsu-bus'
import * as apiKintetsuBusCalendarDate from './routes/api/kintetsu-bus/calendar/[date]'
import * as apiKintetsuBusStopName from './routes/api/kintetsu-bus/stop/[stopName]'

// APIルートを登録
app.get('/api/all', apiAll.GET)
app.get('/api/jr', apiJr.GET)
app.get('/api/kintetsu', apiKintetsu.GET)
app.get('/api/kintetsu-bus', apiKintetsuBus.GET)
app.get('/api/kintetsu-bus/calendar/:date', apiKintetsuBusCalendarDate.GET)
app.get('/api/kintetsu-bus/stop/:stopName', apiKintetsuBusStopName.GET)
app.post('/api/cache/clear', apiCacheClear.POST)

// 静的ファイルの提供
app.use('/static/*', serveStatic({ root: './public' }))

// アプリの初期化時にデータを事前読み込み
export const initApp = async () => {
  if (DEBUG_MODE) {
    console.log('デバッグモードで起動しています: 外部フェッチは行わず、distディレクトリのデータのみを使用します')
  }

  // 必要な初期化処理をここに追加
}

// グローバル変数としてエクスポート
globalThis.app = app