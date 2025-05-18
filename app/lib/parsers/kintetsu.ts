import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { ParserResult, StationResult, TimetableEntry, TimetableParser } from '../types';

export class KintetsuParser implements TimetableParser {
  name = 'kintetsu';

  async parseUrls(urls: string[]): Promise<ParserResult> {
    const result: ParserResult = {};

    if (!urls || urls.length === 0) {
      console.error('近鉄パーサー: URLが指定されていません');
      return result;
    }

    console.log(`近鉄時刻表の取得を開始します (${urls.length} URLs)`);

    for (const urlStr of urls) {
      try {
        console.log(`URLからデータを取得しています: ${urlStr}`);
        const { stationName, timetables } = await this.fetchStationTimetable(urlStr);

        if (!stationName) {
          console.error(`駅名が取得できませんでした: ${urlStr}`);
          continue;
        }

        result[stationName] = timetables;
        console.log(`駅のデータを取得しました: ${stationName}, 方向数: ${Object.keys(timetables).length}`);
      } catch (err) {
        console.error(`URLからのデータ取得中にエラーが発生しました ${urlStr}:`, err);
        if (err instanceof Error) {
          console.error(`エラーの詳細: ${err.message}`);
          console.error(`スタックトレース: ${err.stack}`);
        }
      }
    }

    const stationCount = Object.keys(result).length;
    if (stationCount === 0) {
      console.error('近鉄時刻表データの取得に失敗しました。駅データがありません。');
    } else {
      console.log(`近鉄時刻表の取得が完了しました。駅数: ${stationCount}`);
    }

    return result;
  }

  private async fetchDirection(
    baseUrl: string,
    slCode: string,
    d: string,
    dw: '0' | '1'
  ): Promise<{ directionName: string; entries: TimetableEntry[] }> {
    const url = new URL(baseUrl);
    const sp = url.searchParams;
    sp.set('USR', 'PC');
    sp.set('slCode', slCode);
    sp.set('d', d);
    sp.set('dw', dw);
    sp.set('dmode', 'detail');
    sp.set('pFlg', '0');

    console.log(`方向データを取得中: slCode=${slCode}, d=${d}, dw=${dw} (${dw === '0' ? '平日' : '休日'})`);

    try {
      const res = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }

      const buf = Buffer.from(await res.arrayBuffer());
      const html = iconv.decode(buf, 'shift_jis');
      const $ = cheerio.load(html);

      const hdr = $('#kstimetable .title h3').text().trim();
      const m = hdr.match(/^(.+?方面)/);
      const directionName = m ? m[1] : hdr;

      if (!directionName) {
        console.warn('方面名が取得できませんでした。HTMLの構造が変更された可能性があります。');
      }

      const entries: TimetableEntry[] = [];
      $('#kstimetable table tr').each((_, row) => {
        const hour = $(row).find('th').first().text().trim();
        if (!/^\d+$/.test(hour)) return;
        $(row).find('div.k_1901 a').each((_, aTag) => {
          const $a = $(aTag);
          const minute = $a.find('span').text().trim();
          const href = $a.attr('href') || '';
          const detailUrl = new URL(href, url.toString()).toString();
          const [destination = '', trainType = ''] = $a.clone()
            .children('br').remove().end()
            .text().replace(/\s+/g, ' ').trim().split(' ');
          entries.push({ hour, minute, destination, trainType, detailUrl });
        });
      });

      console.log(`方向「${directionName}」(${dw === '0' ? '平日' : '休日'})のエントリ取得完了: ${entries.length}件`);
      return { directionName, entries };
    } catch (error) {
      console.error(`方向データの取得中にエラーが発生しました:`, error);
      // エラーが発生した場合でも空のデータを返して処理を続行
      return { directionName: '', entries: [] };
    }
  }

  private async fetchStationTimetable(
    initialUrl: string
  ): Promise<{ stationName: string; timetables: StationResult }> {
    const url = new URL(initialUrl);
    url.searchParams.set('dmode', 'detail');
    url.searchParams.set('pFlg', '0');
    console.debug(`fetchStationTimetable: ${url.toString()}`);

    const initRes = await fetch(url.toString(), { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.debug(`  initial status: ${initRes.status}`);
    if (!initRes.ok) throw new Error(`HTTP ${initRes.status}`);
    const buf = Buffer.from(await initRes.arrayBuffer());
    const html = iconv.decode(buf, 'shift_jis');
    const $init = cheerio.load(html);

    const rawName = $init('div.sta h2').text().trim().replace(/■/, '');
    console.debug(`  raw station name: ${rawName}`);
    const sMatch = rawName.match(/(.+?駅)/);
    const stationName = sMatch ? sMatch[1] : rawName;
    console.debug(`  stationName: ${stationName}`);

    const options = $init('select[name=d_select] option').map((_, opt) => {
      const $opt = $init(opt);
      const [slCode, d] = ($opt.attr('value') || '').split(',');
      const name = $opt.text().trim();
      console.debug(`  option: slCode=${slCode}, d=${d}, name=${name}`);
      return { slCode, d, name };
    }).get<{ slCode: string; d: string; name: string }>();

    const timetables: StationResult = {};
    for (const { slCode, d, name } of options) {
      console.debug(`--> direction: ${name}`);
      timetables[name] = { weekday: [], holiday: [] };
      for (const dw of ['0', '1'] as const) {
        const { directionName, entries } = await this.fetchDirection(initialUrl, slCode, d, dw);
        timetables[name][dw === '0' ? 'weekday' : 'holiday'] = entries;
      }
    }
    console.debug(`completed station: ${stationName}, directions: ${Object.keys(timetables).join(', ')}`);
    return { stationName, timetables };
  }
}