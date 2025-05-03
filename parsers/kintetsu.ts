import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { ParserResult, StationResult, TimetableEntry, TimetableParser } from '../types';

export class KintetsuParser implements TimetableParser {
  name = 'kintetsu';

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
   * 詳細時刻表を取得し、方向名とエントリ配列を返す
   */
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

    console.debug(`→ fetchDirection: slCode=${slCode}, d=${d}, dw=${dw}`);
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ja' }
    });
    console.debug(`  status: ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    const html = iconv.decode(buf, 'shift_jis');
    const $ = cheerio.load(html);

    const hdr = $('#kstimetable .title h3').text().trim();
    console.debug(`  raw header: ${hdr}`);
    const m = hdr.match(/^(.+?方面)/);
    const directionName = m ? m[1] : hdr;
    console.debug(`  directionName: ${directionName}`);

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
    console.debug(`  parsed entries: ${entries.length}`);
    return { directionName, entries };
  }

  /**
   * 駅ページから駅名と時刻表をまとめて取得
   */
  private async fetchStationTimetable(
    initialUrl: string
  ): Promise<{ stationName: string; timetables: StationResult }> {
    // 詳細モードで取得
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