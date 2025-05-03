import * as cheerio from 'cheerio';
import { ParserResult, StationResult, TimetableEntry, TimetableParser } from '../types';

export class JRParser implements TimetableParser {
  name = 'jr';

  async parseUrls(urls: string[]): Promise<ParserResult> {
    const result: ParserResult = {};
    for (const urlStr of urls) {
      try {
        const { stationName, timetables } = await this.fetchStationTimetable(urlStr);
        result[stationName] = timetables;
      } catch (err) {
        console.error(`Error fetching ${urlStr}:`, err);
      }
    }
    return result;
  }

  /**
   * 駅ページから駅名と時刻表をまとめて取得
   */
  private async fetchStationTimetable(
    initialUrl: string
  ): Promise<{ stationName: string; timetables: StationResult }> {
    console.debug(`fetchStationTimetable: ${initialUrl}`);

    // JRの時刻表ページの取得処理を実装
    // 以下はダミー実装のため、実際のJRサイトに合わせて修正が必要
    const res = await fetch(initialUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // 駅名抽出（実際のセレクタに変更する必要あり）
    const stationName = $('.station-name').text().trim() || 'テスト駅';

    // ダミーデータを返す（実際の実装では下記を適切に置き換える）
    const timetables: StationResult = {
      '大阪方面': {
        weekday: this.generateDummyEntries(),
        holiday: this.generateDummyEntries()
      },
      '京都方面': {
        weekday: this.generateDummyEntries(),
        holiday: this.generateDummyEntries()
      }
    };

    return { stationName, timetables };
  }

  /**
   * テスト用ダミーデータ生成（実際は削除して実装を行う）
   */
  private generateDummyEntries(): TimetableEntry[] {
    const entries: TimetableEntry[] = [];
    for (let h = 5; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        entries.push({
          hour: h.toString(),
          minute: m.toString().padStart(2, '0'),
          destination: m % 30 === 0 ? '快速 姫路' : '各停 西明石',
          trainType: m % 30 === 0 ? '快速' : '普通',
          detailUrl: `https://example.com/jr/detail?h=${h}&m=${m}`
        });
      }
    }
    return entries;
  }
}