// filepath: /Users/a/Documents/fun/pg/lh/research-kindai/src/api/views.ts
import { html } from 'hono/html';

/**
 * 共通レイアウトのHTMLテンプレート
 */
export const layout = (title: string, content: string, options: { additionalStyles?: string } = {}) => html`
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      .container { max-width: 1000px; margin: 0 auto; }
      h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
      h2 { margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
      a { color: #0066cc; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
      th { background-color: #f5f5f5; }
      .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; }
      .type-a { background-color: #e6f7ff; }
      .type-b { background-color: #fff7e6; }
      .alert { padding: 15px; border-radius: 5px; margin: 20px 0; }
      .alert-info { background-color: #e6f7ff; border: 1px solid #91d5ff; }
      .alert-danger { background-color: #fff2f0; border: 1px solid #ffccc7; }
      ${options.additionalStyles || ''}
    </style>
  </head>
  <body>
    <div class="container">
      ${content}
    </div>
  </body>
  </html>
`;

/**
 * APIホームページのHTML
 */
export const homePage = () => {
  const content = html`
    <h1>鉄道・バス時刻表API</h1>
    <p>JR・近鉄の鉄道時刻表と近鉄バスの時刻表データを提供するAPIです。</p>
    
    <h2>APIエンドポイント</h2>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/kintetsu</span> - 近鉄の時刻表データを取得</p>
    </div>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/jr</span> - JRの時刻表データを取得</p>
    </div>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/kintetsu-bus</span> - 近鉄バスの全時刻表データを取得</p>
      <p><a href="/view/kintetsu-bus">HTML形式で表示</a></p>
    </div>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/kintetsu-bus/calendar/:date</span> - 指定日の運行情報を取得</p>
      <p>例: <a href="/api/kintetsu-bus/calendar/2025-05-07">/api/kintetsu-bus/calendar/2025-05-07</a></p>
    </div>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/kintetsu-bus/stop/:stopName</span> - 特定のバス停の時刻表を取得</p>
      <p>例: <a href="/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07">/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07</a></p>
      <p>HTML形式で表示: <a href="/view/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07">/view/kintetsu-bus/stop/近畿大学東門前</a></p>
    </div>
    
    <div class="endpoint">
      <p><span class="method">GET</span> <span class="path">/api/all</span> - すべての鉄道・バス会社のデータを統合して取得</p>
    </div>
    
    <h2>HTML ビュー</h2>
    <ul>
      <li><a href="/view/kintetsu-bus/calendar">近鉄バス運行カレンダー</a> - 月別カレンダー表示</li>
      <li><a href="/view/kintetsu-bus/stop/近畿大学東門前">近畿大学東門前バス停</a> - バス停の時刻表</li>
      <li><a href="/view/kintetsu-bus/stop/八戸ノ里駅前">八戸ノ里駅前バス停</a> - バス停の時刻表</li>
    </ul>
  `;
  
  return layout('鉄道・バス時刻表API', content, {
    additionalStyles: `
      .endpoint { margin: 15px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
      .method { font-weight: bold; color: #2c873a; }
      .path { font-family: monospace; }
      ul { padding-left: 20px; }
      li { margin: 5px 0; }
      .separator { margin: 30px 0; border-top: 1px dashed #ccc; }
    `
  });
};

/**
 * エラーページのHTML
 */
export const errorPage = (title: string, message: string) => {
  const content = html`
    <h1>${title}</h1>
    <div class="alert alert-danger">
      <p>${message}</p>
    </div>
    <p><a href="/">← ホームに戻る</a></p>
  `;
  
  return layout(title, content);
};

/**
 * 近鉄バスのカレンダーページ用に日付セルを生成
 */
export const generateCalendarCellHTML = (
  dateKey: string, 
  dayCount: number, 
  operationType: 'A' | 'B' | null, 
  isToday: boolean
) => {
  let cssClass = '';
  let operationText = '';
  
  if (operationType === 'A') {
    cssClass = 'type-a';
    operationText = 'A';
  } else if (operationType === 'B') {
    cssClass = 'type-b';
    operationText = 'B';
  } else {
    cssClass = 'no-operation';
    operationText = '×';
  }
  
  // 今日の日付には特別なクラスを適用
  if (isToday) {
    cssClass += ' today';
  }
  
  return `
    <td class="${cssClass}">
      <a href="/view/kintetsu-bus/calendar/${dateKey}" title="${dateKey}の運行情報">
        ${dayCount}<br>${operationText}
      </a>
    </td>
  `;
};

/**
 * 日付選択部分のHTML
 */
export const dateSelector = (year: number, month: number, day: number, stopName: string) => {
  return html`
    <div class="date-selector">
      <label for="year">年:</label>
      <select id="year">
        <option value="2025" ${year === 2025 ? 'selected' : ''}>2025</option>
        <option value="2026" ${year === 2026 ? 'selected' : ''}>2026</option>
      </select>
      
      <label for="month">月:</label>
      <select id="month">
        ${Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
          `<option value="${m}" ${m === month ? 'selected' : ''}>${m}</option>`
        ).join('')}
      </select>
      
      <label for="day">日:</label>
      <select id="day">
        ${Array.from({ length: 31 }, (_, i) => i + 1).map(d =>
          `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`
        ).join('')}
      </select>
      
      <button onclick="goToDate()">表示</button>
    </div>
    
    <script>
      function goToDate() {
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;
        const day = document.getElementById('day').value;
        
        // padStartを使う代わりにif文で0を追加
        const paddedMonth = month.length === 1 ? '0' + month : month;
        const paddedDay = day.length === 1 ? '0' + day : day;
        
        const date = year + '-' + paddedMonth + '-' + paddedDay;
        window.location.href = "/view/kintetsu-bus/stop/${stopName}?date=" + date;
      }
    </script>
  `;
};

/**
 * 近鉄バスのカレンダーページのHTML
 */
export const busCalendarPage = (calendarHTML: string) => {
  const content = html`
    <h1>近鉄バス運行カレンダー</h1>
    <p><a href="/">← ホームに戻る</a></p>
    
    <div class="legend">
      <span><span class="legend-color" style="background-color: #e6f7ff;"></span>運行日（A）: 平日ダイヤ</span>
      <span><span class="legend-color" style="background-color: #fff7e6;"></span>運行日（B）: 土曜・休日ダイヤ</span>
      <span><span class="legend-color" style="background-color: #f5f5f5;"></span>×: 運休</span>
    </div>
    
    <div class="calendar-container">
      ${calendarHTML}
    </div>
  `;
  
  return layout('近鉄バス運行カレンダー', content, {
    additionalStyles: `
      .container { max-width: 1200px; }
      .calendar-container { display: flex; flex-wrap: wrap; gap: 20px; }
      .month { width: calc(33.333% - 20px); margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: center; padding: 5px; border: 1px solid #ddd; }
      th { background-color: #f5f5f5; }
      .no-operation { background-color: #f5f5f5; color: #999; }
      .today { border: 2px solid #ff4d4f; font-weight: bold; }
      .legend { margin: 20px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
      .legend span { display: inline-block; margin-right: 15px; }
      .legend-color { display: inline-block; width: 15px; height: 15px; margin-right: 5px; vertical-align: middle; }
      a { color: inherit; text-decoration: none; }
      a:hover { text-decoration: underline; }
    `
  });
};

/**
 * 近鉄バスの特定日のカレンダーページのHTML
 */
export const busDayCalendarPage = (date: string, contentHTML: string) => {
  const content = html`
    <h1>近鉄バス運行情報</h1>
    <p>
      <a href="/">← ホームに戻る</a> | 
      <a href="/view/kintetsu-bus/calendar">カレンダーに戻る</a>
    </p>
    
    ${contentHTML}
  `;
  
  return layout(`${date} 近鉄バス運行情報`, content, {
    additionalStyles: `
      .container { max-width: 1200px; }
      .stops-container { display: flex; flex-wrap: wrap; gap: 20px; }
      .stop-info { width: calc(50% - 20px); margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    `
  });
};

/**
 * 近鉄バスの全データページのHTML
 */
export const busAllDataPage = (stopsListHTML: string, routesInfoHTML: string) => {
  const content = html`
    <h1>近鉄バス時刻表</h1>
    <p><a href="/">← ホームに戻る</a> | <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a></p>
    
    <h2>バス停一覧</h2>
    <div class="stops-list">
      ${stopsListHTML}
    </div>
    
    <h2>路線情報</h2>
    ${routesInfoHTML}
  `;
  
  return layout('近鉄バス時刻表', content, {
    additionalStyles: `
      .container { max-width: 1200px; }
      .route-info { margin-bottom: 40px; }
      .stop-link { display: inline-block; margin: 5px 10px; padding: 5px 10px; background-color: #f0f0f0; border-radius: 5px; }
      a:hover { background-color: #e0e0e0; }
      .type-container { margin-bottom: 30px; }
    `
  });
};

/**
 * バス停の時刻表ページのHTML
 */
export const busStopPage = (
  stopName: string, 
  year: number, 
  month: number, 
  day: number, 
  dayOfWeekJP: string,
  operationType: 'A' | 'B',
  routeName: string,
  scheduleHTML: string,
  prevDate: string,
  nextDate: string
) => {
  const content = html`
    <h1>${stopName} バス時刻表</h1>
    <p>
      <a href="/">← ホームに戻る</a> | 
      <a href="/view/kintetsu-bus">バス時刻表一覧に戻る</a> | 
      <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a>
    </p>
    
    <h2>${year}年${month}月${day}日(${dayOfWeekJP})</h2>
    <p>運行タイプ: <span class="badge ${operationType === 'A' ? 'type-a' : 'type-b'}">
      ${operationType === 'A' ? '平日ダイヤ (A)' : '土曜・休日ダイヤ (B)'}
    </span></p>
    <p>路線: ${routeName}</p>
    
    <!-- 日付選択 -->
    ${dateSelector(year, month, day, stopName)}
    
    <!-- 前日・翌日リンク -->
    <div class="navigate-links">
      <a href="/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}?date=${prevDate}">&lt; 前日</a>
      <a href="/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}?date=${nextDate}">翌日 &gt;</a>
    </div>
    
    <!-- 時刻表 -->
    <h3>時刻表</h3>
    <table>
      <thead>
        <tr>
          <th>時</th>
          <th>分</th>
        </tr>
      </thead>
      <tbody>
        ${scheduleHTML}
      </tbody>
    </table>
    
    <p>※道路状況によりバスの到着が遅れることがございますので、ご了承くださいますようお願い申し上げます。</p>
  `;
  
  return layout(`${stopName} - バス時刻表`, content, {
    additionalStyles: `
      .container { max-width: 800px; }
      .hour { font-weight: bold; text-align: center; width: 60px; }
      .date-selector { margin: 20px 0; }
      .date-selector select { padding: 5px; margin-right: 10px; }
      .date-selector button { padding: 5px 10px; background-color: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer; }
      .navigate-links { display: flex; justify-content: space-between; margin: 20px 0; }
    `
  });
};

/**
 * 運行なしメッセージページ
 */
export const busNoOperationPage = (stopName: string, year: number, month: number, day: number, dayOfWeekJP: string) => {
  const content = html`
    <h1>${stopName} バス時刻表</h1>
    <p>${year}年${month}月${day}日(${dayOfWeekJP})</p>
    <div class="alert alert-info">
      <p>この日は運行していません。</p>
    </div>
    <p><a href="/">← ホームに戻る</a> | <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a></p>
  `;
  
  return layout(`${stopName} - バス時刻表`, content, {
    additionalStyles: `
      .container { max-width: 800px; }
    `
  });
};