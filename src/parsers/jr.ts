import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { TimetableEntry } from '../types';
import { ensureDirectoryExists } from '../utils/config';

interface StationTimetables {
  [directionName: string]: TimetableEntry[];
}

const destinationMap: Record<string, string> = {
  '放': '放出',
  '大': '大阪',
  '久': '久宝寺',
  '奈': '奈良',
};

async function fetchStationTimetable(url: string): Promise<{ stationName: string; timetables: StationTimetables }> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const stationName = $('.route-name01').text().trim();
  const directionName = $('.route-name03').text().trim();

  const entries: TimetableEntry[] = [];

  $('.pc-time-tbl-wrap table tbody tr.body-row').each((_, row) => {
    const hour = $(row).find('td.hour').text().trim();
    $(row).find('td.minutes .minute-item').each((_, item) => {
      const $item = $(item);
      const minute = $item.find('.minute-box .minute').text().trim();
      let destination = $item.find('.minute-box .destination').text().trim();
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

export async function parseJR() {
  const urls = [
    'https://timetable.jr-odekake.net/station-timetable/8220073001', // 放出・新大阪・大阪方面
    'https://timetable.jr-odekake.net/station-timetable/8220073002', // 久宝寺・奈良方面
  ];

  const allResults: Record<string, StationTimetables> = {};
  const outputDir = './dist';

  ensureDirectoryExists(outputDir);

  for (const url of urls) {
    try {
      const { stationName, timetables } = await fetchStationTimetable(url);
      if (!allResults[stationName]) {
        allResults[stationName] = {};
      }
      Object.entries(timetables).forEach(([dir, list]) => {
        allResults[stationName][dir] = list;
      });
    } catch (err) {
      console.error(`取得エラー (${url}):`, err);
    }
  }

  const outputPath = path.join(outputDir, 'jr-train.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`JRの結果を ${outputPath} に出力しました`);

  return allResults;
}