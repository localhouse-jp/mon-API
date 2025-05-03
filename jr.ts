// 必要パッケージのインストール
// bun add cheerio

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface TimetableEntry {
  hour: string;  // 時
  minute: string;  // 分
  destination: string;  // 行き先（正式名称）
  trainType: string;  // 列車種別
  detailUrl: string;  // 詳細ページへの絶対 URL
}

interface StationTimetables {
  [directionName: string]: TimetableEntry[];
}

// 略称から正式名称へのマッピング
const destinationMap: Record<string, string> = {
  '放': '放出',
  '大': '大阪',
  '久': '久宝寺',
  '奈': '奈良',
  // 必要に応じて他の略称も追加
};

/**
 * 出力ディレクトリを確保
 * @param dir ディレクトリパス
 */
function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`ディレクトリを作成しました: ${dir}`);
  }
}

/**
 * JRおでかけネット 駅時刻表を取得して JSON 生成
 * @param url 駅時刻表ページ URL
 * @returns 駅名とその各方面の時刻表リスト
 */
async function fetchStationTimetable(url: string): Promise<{ stationName: string; timetables: StationTimetables }> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // 駅名・方向名
  const stationName = $('.route-name01').text().trim();
  const directionName = $('.route-name03').text().trim();

  const entries: TimetableEntry[] = [];

  // PC版時刻表 tbody tr.body-row をループ
  $('.pc-time-tbl-wrap table tbody tr.body-row').each((_, row) => {
    const hour = $(row).find('td.hour').text().trim();
    $(row).find('td.minutes .minute-item').each((_, item) => {
      const $item = $(item);
      const minute = $item.find('.minute-box .minute').text().trim();
      let destination = $item.find('.minute-box .destination').text().trim();
      // 略称を正式名称に置換
      if (destinationMap[destination]) {
        destination = destinationMap[destination];
      }
      const trainType = $item.find('.minute-box .train-type span').text().trim();
      const href = $item.find('a').attr('href') || '';
      const detailUrl = new URL(href, url).toString();
      entries.push({ hour, minute, destination, trainType, detailUrl });
    });
  });

  return { stationName, timetables: { [directionName]: entries } };
}

// ────────────────────────────────────────────────────────────
// 複数方向をマージして同じ駅の下にまとめる実行例
// ────────────────────────────────────────────────────────────
(async () => {
  const urls = [
    'https://timetable.jr-odekake.net/station-timetable/8220073001', // 放出・新大阪・大阪方面
    'https://timetable.jr-odekake.net/station-timetable/8220073002', // 久宝寺・奈良方面
  ];

  const allResults: Record<string, StationTimetables> = {};
  const outputDir = './dist';

  // 出力ディレクトリを確保
  ensureDirectoryExists(outputDir);

  for (const url of urls) {
    try {
      const { stationName, timetables } = await fetchStationTimetable(url);
      if (!allResults[stationName]) {
        allResults[stationName] = {};
      }
      // マージ
      Object.entries(timetables).forEach(([dir, list]) => {
        allResults[stationName][dir] = list;
      });
    } catch (err) {
      console.error(`取得エラー (${url}):`, err);
    }
  }

  // 結果をファイルに書き込み
  const outputPath = path.join(outputDir, 'jr-train.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`JRの結果を ${outputPath} に出力しました`);
})();
