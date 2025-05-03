import * as fs from 'fs';
import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import * as path from 'path';
import { parseJR } from '../parsers/jr';
import { KintetsuParser } from '../parsers/kintetsu';
import {
  parsedBusData,
  getBusScheduleForDate,
  kintetsuBusCalendar,
  kintetsuBusRoutes,
  BusScheduleEntry
} from '../parsers/kintetsu-bus';
import { DataCache } from '../utils/cache';
import { ensureDirectoryExists, loadConfig } from '../utils/config';
import * as views from './views';

const app = new Hono();
const config = loadConfig();
const outputDir = config.outputDir || './dist';
ensureDirectoryExists(outputDir);

// デバッグモードの設定（DEBUG_MODE=true が設定されていると外部フェッチを行わない）
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

const CACHE_VALIDITY_MS = process.env.CACHE_VALIDITY_MS ? parseInt(process.env.CACHE_VALIDITY_MS) : 60 * 60 * 1000;
const dataCache = new DataCache(CACHE_VALIDITY_MS);

// CORSの設定を追加 - すべてのオリジンからのリクエストを許可
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}));

// ロギングミドルウェア
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.url} - ${end - start}ms`);
});

async function fetchJRData() {
  // デバッグモードの場合はキャッシュファイルのみを読み込む
  if (DEBUG_MODE) {
    try {
      const jrFilePath = path.join(outputDir, 'jr-train.json');
      if (fs.existsSync(jrFilePath)) {
        console.log('デバッグモード: JRデータをキャッシュから読み込みます');
        const data = JSON.parse(fs.readFileSync(jrFilePath, 'utf-8'));
        return data;
      } else {
        console.error('デバッグモード: JRのキャッシュファイルが見つかりません');
        return null;
      }
    } catch (e) {
      console.error('デバッグモード: JRのキャッシュファイルの読み込みに失敗しました:', e);
      return null;
    }
  }

  // 通常モード
  try {
    return await parseJR();
  } catch (error) {
    console.error('JRデータの取得に失敗しました:', error);
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

async function fetchKintetsuData() {
  // デバッグモードの場合はキャッシュファイルのみを読み込む
  if (DEBUG_MODE) {
    try {
      const kintetsuFilePath = path.join(outputDir, 'kintetsu-train.json');
      if (fs.existsSync(kintetsuFilePath)) {
        console.log('デバッグモード: 近鉄データをキャッシュから読み込みます');
        const data = JSON.parse(fs.readFileSync(kintetsuFilePath, 'utf-8'));
        return data;
      } else {
        console.error('デバッグモード: 近鉄のキャッシュファイルが見つかりません');
        return null;
      }
    } catch (e) {
      console.error('デバッグモード: 近鉄のキャッシュファイルの読み込みに失敗しました:', e);
      return null;
    }
  }

  // 通常モード
  try {
    const kintetsuConfig = config.parsers.find(p => p.name.toLowerCase() === 'kintetsu');
    if (!kintetsuConfig) {
      console.log('近鉄の設定が見つかりません');
      return null;
    }

    const parser = new KintetsuParser();
    const result = await parser.parseUrls(kintetsuConfig.urls);

    const outputPath = path.join(outputDir, 'kintetsu-train.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    return result;
  } catch (error) {
    console.error('近鉄データの取得に失敗しました:', error);
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

// APIエンドポイント
app.get('/api/kintetsu', cache({ cacheName: 'kintetsu-api', cacheControl: 'max-age=3600' }), async (c) => {
  const data = await dataCache.get('kintetsu', fetchKintetsuData);
  if (!data) {
    return c.json({ error: '近鉄のデータを取得できませんでした' }, 500);
  }
  return c.json(data);
});

app.get('/api/jr', cache({ cacheName: 'jr-api', cacheControl: 'max-age=3600' }), async (c) => {
  const data = await dataCache.get('jr', fetchJRData);
  if (!data) {
    return c.json({ error: 'JRのデータを取得できませんでした' }, 500);
  }
  return c.json(data);
});

app.get('/api/kintetsu-bus', cache({ cacheName: 'kintetsu-bus-api', cacheControl: 'max-age=3600' }), async (c) => {
  return c.json(parsedBusData);
});

app.get('/api/kintetsu-bus/calendar/:date', cache({ cacheName: 'kintetsu-bus-calendar-api', cacheControl: 'max-age=3600' }), async (c) => {
  const date = c.req.param('date');
  
  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。' }, 400);
  }
  
  return c.json(getBusScheduleForDate(date));
});

app.get('/api/kintetsu-bus/stop/:stopName', cache({ cacheName: 'kintetsu-bus-stop-api', cacheControl: 'max-age=3600' }), async (c) => {
  const stopName = c.req.param('stopName');
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];
  
  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。' }, 400);
  }
  
  return c.json(getBusScheduleForDate(date, decodeURIComponent(stopName)));
});

app.get('/api/all', cache({ cacheName: 'all-api', cacheControl: 'max-age=3600' }), async (c) => {
  const [kintetsu, jr, kintetsuBus] = await Promise.all([
    dataCache.get('kintetsu', fetchKintetsuData),
    dataCache.get('jr', fetchJRData),
    parsedBusData
  ]);

  return c.json({
    kintetsu,
    jr,
    kintetsuBus,
    lastUpdated: new Date().toISOString()
  });
});

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

// HTMLビュールート
// ルートパスへのアクセスでAPIドキュメントを表示
app.get('/', async (c) => {
  return c.html(views.homePage());
});

// 近鉄バスカレンダーのHTMLビュー
app.get('/view/kintetsu-bus/calendar', async (c) => {
  // 現在の日付を取得
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  let calendarHTML = '';

  // 各月のカレンダーを生成
  for (const month of months) {
    const year = month < 4 ? 2026 : 2025;  // 4月始まりの学校カレンダー
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

    // 月の最初の日と最終日を取得
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // 月のカレンダーを生成
    calendarHTML += `
      <div class="month">
        <h3>${year}年${month}月</h3>
        <table>
          <thead>
            <tr>
              <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
            </tr>
          </thead>
          <tbody>
    `;

    // 月の最初の日の曜日を取得（0:日曜, 1:月曜, ..., 6:土曜）
    let dayOfWeek = firstDay.getDay();
    let dayCount = 0;

    // カレンダーの行を生成
    for (let i = 0; i < 6; i++) {
      calendarHTML += '<tr>';

      // 1行（7日）の生成
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < dayOfWeek) || dayCount >= daysInMonth) {
          calendarHTML += '<td></td>';
        } else {
          dayCount++;
          const dateKey = `${monthKey}-${dayCount.toString().padStart(2, '0')}`;
          const operationType = kintetsuBusCalendar[dateKey];
          
          // 今日の日付かどうかを判定
          const isToday = (year === currentYear && month === currentMonth && dayCount === today.getDate());
          
          calendarHTML += views.generateCalendarCellHTML(dateKey, dayCount, operationType, isToday);
        }
      }

      calendarHTML += '</tr>';

      // 月のすべての日を表示したら残りの行はスキップ
      if (dayCount >= daysInMonth) break;
    }

    calendarHTML += `
          </tbody>
        </table>
      </div>
    `;
  }

  return c.html(views.busCalendarPage(calendarHTML));
});

// 特定日の近鉄バスカレンダーのHTMLビュー
app.get('/view/kintetsu-bus/calendar/:date', async (c) => {
  const date = c.req.param('date');

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.html(views.errorPage('エラー', '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。'), 400);
  }

  const scheduleData = getBusScheduleForDate(date);
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeekJP = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];

  let contentHTML = '';

  if (!scheduleData.operationType) {
    contentHTML = `
      <div class="alert alert-info">
        <h2>${year}年${month}月${day}日(${dayOfWeekJP})の運行情報</h2>
        <p>この日は運行していません。</p>
      </div>
    `;
  } else {
    contentHTML = `
      <h2>${year}年${month}月${day}日(${dayOfWeekJP})の運行情報</h2>
      <p>運行タイプ: <span class="badge ${scheduleData.operationType === 'A' ? 'type-a' : 'type-b'}">
        ${scheduleData.operationType === 'A' ? '平日ダイヤ (A)' : '土曜・休日ダイヤ (B)'}
      </span></p>
      
      <div class="stops-container">
    `;

    // 各バス停の時刻表を表示
    for (const stop of scheduleData.stops) {
      contentHTML += `
        <div class="stop-info">
          <h3>${stop.stopName}</h3>
          <p>路線: ${stop.routeName}</p>
          <table>
            <thead>
              <tr>
                <th>時刻</th>
                <th>分</th>
              </tr>
            </thead>
            <tbody>
      `;

      // 時刻表の各行を表示
      for (const hour of stop.schedule) {
        contentHTML += `
          <tr>
            <td>${hour.hour}</td>
            <td>${hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
          </tr>
        `;
      }

      contentHTML += `
            </tbody>
          </table>
          <p><a href="/view/kintetsu-bus/stop/${encodeURIComponent(stop.stopName)}?date=${date}">詳細を見る</a></p>
        </div>
      `;
    }

    contentHTML += '</div>';
  }

  return c.html(views.busDayCalendarPage(date, contentHTML));
});

// 近鉄バスの全データをHTMLでビュー
app.get('/view/kintetsu-bus', async (c) => {
  // バス停一覧のHTMLを生成
  const stopsListHTML = kintetsuBusRoutes.flatMap(route =>
    route.stops.map(stop =>
      `<a href="/view/kintetsu-bus/stop/${encodeURIComponent(stop.stopName)}" class="stop-link">${stop.stopName}</a>`
    )
  ).filter((v, i, a) => a.indexOf(v) === i).join('');

  // 路線情報のHTMLを生成
  const routesInfoHTML = kintetsuBusRoutes.map(route => `
    <div class="route-info">
      <h3>${route.name}</h3>
      <p><strong>バス停:</strong> ${route.stops.map(stop => stop.stopName).join(' → ')}</p>
      
      <div class="type-container">
        <h4>運行日(A)時刻表</h4>
        ${route.stops.map(stop => `
          <div>
            <h5>${stop.stopName}</h5>
            <table>
              <thead>
                <tr>
                  <th>時</th>
                  <th>分</th>
                </tr>
              </thead>
              <tbody>
                ${stop.schedule.A.map(hour => `
                  <tr>
                    <td>${hour.hour}</td>
                    <td>${hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>
      
      <div class="type-container">
        <h4>運行日(B)時刻表</h4>
        ${route.stops.map(stop => `
          <div>
            <h5>${stop.stopName}</h5>
            <table>
              <thead>
                <tr>
                  <th>時</th>
                  <th>分</th>
                </tr>
              </thead>
              <tbody>
                ${stop.schedule.B.map(hour => `
                  <tr>
                    <td>${hour.hour}</td>
                    <td>${hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return c.html(views.busAllDataPage(stopsListHTML, routesInfoHTML));
});

// バス停ごとの時刻表HTMLビュー
app.get('/view/kintetsu-bus/stop/:stopName', async (c) => {
  const stopName = decodeURIComponent(c.req.param('stopName'));
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.html(views.errorPage('エラー', '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。'), 400);
  }

  const scheduleData = getBusScheduleForDate(date, stopName);
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeekJP = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];

  // バス停が見つからない場合のエラー表示
  if (scheduleData.error) {
    return c.html(views.errorPage('エラー - バス停が見つかりません', scheduleData.error), 404);
  }

  // 運行していない日の表示
  if (!scheduleData.operationType) {
    return c.html(views.busNoOperationPage(stopName, year, month, day, dayOfWeekJP));
  }

  // 前日と翌日の日付を計算
  const prevDate = new Date(dateObj.getTime() - 86400000).toISOString().split('T')[0];
  const nextDate = new Date(dateObj.getTime() + 86400000).toISOString().split('T')[0];

  // 時刻表HTMLを生成
  const scheduleHTML = scheduleData.schedule.map(hour => `
    <tr>
      <td class="hour">${hour.hour}</td>
      <td class="minutes">${hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
    </tr>
  `).join('');

  return c.html(views.busStopPage(
    stopName,
    year,
    month,
    day,
    dayOfWeekJP,
    scheduleData.operationType,
    scheduleData.routeName,
    scheduleHTML,
    prevDate,
    nextDate
  ));
});

export function initRoutes() {
  if (DEBUG_MODE) {
    console.log('デバッグモードで起動しています: 外部フェッチは行わず、distディレクトリのデータのみを使用します');
  }

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