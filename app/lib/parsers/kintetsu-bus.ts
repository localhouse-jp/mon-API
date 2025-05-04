// filepath: /Users/a/Documents/fun/pg/lh/research-kindai/src/parsers/kintetsu-bus.ts
import { ParserResult } from '../types';

// カレンダータイプの定義（A:平日、B:休日、null:運休）
export interface BusCalendar {
  [date: string]: 'A' | 'B' | null;
}

// バススケジュールの型定義
interface HourSchedule {
  hour: number;
  minutes: number[];
}

interface StopSchedule {
  schedule: {
    A: HourSchedule[];
    B: HourSchedule[];
  };
  stopName: string;
}

interface BusRoute {
  name: string;
  stops: StopSchedule[];
}

export class KintetsuBusParser {
  name = 'kintetsu-bus';

  parseData(calendarData: BusCalendar, routeData: BusRoute[]): ParserResult {
    // 近鉄バスデータをAPIのレスポンス形式に変換
    const result: ParserResult = {};

    // 各路線ごとに処理
    routeData.forEach(route => {
      // 各バス停ごとに処理
      route.stops.forEach(stop => {
        const stationName = stop.stopName;
        result[stationName] = {};

        // 方面名（路線名）を設定
        result[stationName][route.name] = {
          // 平日（運行日A）と休日（運行日B）の区分で時刻表を設定
          weekday: this.convertScheduleToTimetableEntries(stop.schedule.A, stationName, route.name),
          holiday: this.convertScheduleToTimetableEntries(stop.schedule.B, stationName, route.name)
        };
      });
    });

    return result;
  }

  // 運行カレンダーから指定日の運行タイプを取得
  getOperationTypeForDate(calendar: BusCalendar, date: Date): 'A' | 'B' | null {
    const dateString = date.toISOString().split('T')[0];
    return calendar[dateString] || null;
  }

  // 時刻表データをAPIの形式に変換
  private convertScheduleToTimetableEntries(
    schedule: HourSchedule[],
    stationName: string,
    routeName: string
  ) {
    return schedule.flatMap(entry => {
      return entry.minutes.map(minute => {
        return {
          hour: String(entry.hour),
          minute: String(minute),
          destination: routeName,
          trainType: 'バス',
          detailUrl: ''
        };
      });
    });
  }

  // 特定の日付の時刻表を取得
  getScheduleForDate(
    calendar: BusCalendar,
    routeData: BusRoute[],
    date: Date,
    stopName: string
  ) {
    const operationType = this.getOperationTypeForDate(calendar, date);
    if (!operationType) return null; // 運行なしの日

    // 指定されたバス停のスケジュールを探す
    for (const route of routeData) {
      const stop = route.stops.find(s => s.stopName === stopName);
      if (stop) {
        return {
          date: date.toISOString().split('T')[0],
          stopName,
          routeName: route.name,
          operationType,
          schedule: stop.schedule[operationType]
        };
      }
    }

    return null; // 指定されたバス停が見つからない場合
  }
}

// 近鉄バスの運行カレンダーデータ
export const kintetsuBusCalendar: BusCalendar = {
  // 4月
  "2025-04-01": null, "2025-04-02": null, "2025-04-03": null, "2025-04-04": null, "2025-04-05": null,
  "2025-04-06": null, "2025-04-07": null, "2025-04-08": null, "2025-04-09": null, "2025-04-10": null,
  "2025-04-11": null, "2025-04-12": null, "2025-04-13": null, "2025-04-14": null, "2025-04-15": null,
  "2025-04-16": "A", "2025-04-17": "A", "2025-04-18": "A", "2025-04-19": "B", "2025-04-20": "B",
  "2025-04-21": "A", "2025-04-22": "A", "2025-04-23": "A", "2025-04-24": "A", "2025-04-25": "A",
  "2025-04-26": "B", "2025-04-27": "B", "2025-04-28": "A", "2025-04-29": "B", "2025-04-30": "A",

  // 5月
  "2025-05-01": "A", "2025-05-02": "A", "2025-05-03": null, "2025-05-04": null, "2025-05-05": null,
  "2025-05-06": null, "2025-05-07": "A", "2025-05-08": "A", "2025-05-09": "A", "2025-05-10": "B",
  "2025-05-11": null, "2025-05-12": "A", "2025-05-13": "A", "2025-05-14": "A", "2025-05-15": "A",
  "2025-05-16": "A", "2025-05-17": "B", "2025-05-18": null, "2025-05-19": "A", "2025-05-20": "A",
  "2025-05-21": "A", "2025-05-22": "A", "2025-05-23": "A", "2025-05-24": "B", "2025-05-25": "B",
  "2025-05-26": "A", "2025-05-27": "A", "2025-05-28": "A", "2025-05-29": "A", "2025-05-30": "A", "2025-05-31": "B",

  // 6月
  "2025-06-01": null, "2025-06-02": "A", "2025-06-03": "A", "2025-06-04": "A", "2025-06-05": "A",
  "2025-06-06": "A", "2025-06-07": "B", "2025-06-08": null, "2025-06-09": "A", "2025-06-10": "A",
  "2025-06-11": "A", "2025-06-12": "A", "2025-06-13": "A", "2025-06-14": "B", "2025-06-15": null,
  "2025-06-16": "A", "2025-06-17": "A", "2025-06-18": "A", "2025-06-19": "A", "2025-06-20": "A",
  "2025-06-21": "B", "2025-06-22": "B", "2025-06-23": "A", "2025-06-24": "A", "2025-06-25": "A",
  "2025-06-26": "A", "2025-06-27": "A", "2025-06-28": "B", "2025-06-29": "B", "2025-06-30": "A",

  // 7月
  "2025-07-01": "A", "2025-07-02": "A", "2025-07-03": "A", "2025-07-04": "A", "2025-07-05": "B",
  "2025-07-06": null, "2025-07-07": "A", "2025-07-08": "A", "2025-07-09": "A", "2025-07-10": "A",
  "2025-07-11": "A", "2025-07-12": "B", "2025-07-13": null, "2025-07-14": "A", "2025-07-15": "A",
  "2025-07-16": "A", "2025-07-17": "A", "2025-07-18": "A", "2025-07-19": "B", "2025-07-20": null,
  "2025-07-21": "A", "2025-07-22": "A", "2025-07-23": "A", "2025-07-24": "A", "2025-07-25": "A",
  "2025-07-26": "B", "2025-07-27": "B", "2025-07-28": "A", "2025-07-29": "A", "2025-07-30": "A", "2025-07-31": "A",

  // 8月
  "2025-08-01": "A", "2025-08-02": null, "2025-08-03": null, "2025-08-04": "A", "2025-08-05": null,
  "2025-08-06": "A", "2025-08-07": "A", "2025-08-08": null, "2025-08-09": null, "2025-08-10": null,
  "2025-08-11": null, "2025-08-12": null, "2025-08-13": null, "2025-08-14": null, "2025-08-15": null,
  "2025-08-16": "A", "2025-08-17": null, "2025-08-18": "A", "2025-08-19": "A", "2025-08-20": "A",
  "2025-08-21": "A", "2025-08-22": "A", "2025-08-23": "B", "2025-08-24": "B", "2025-08-25": "A",
  "2025-08-26": "A", "2025-08-27": "A", "2025-08-28": "A", "2025-08-29": "A", "2025-08-30": "B", "2025-08-31": null,

  // 9月
  "2025-09-01": "A", "2025-09-02": null, "2025-09-03": "A", "2025-09-04": null, "2025-09-05": "A",
  "2025-09-06": null, "2025-09-07": null, "2025-09-08": null, "2025-09-09": null, "2025-09-10": null,
  "2025-09-11": null, "2025-09-12": null, "2025-09-13": null, "2025-09-14": null, "2025-09-15": null,
  "2025-09-16": "A", "2025-09-17": null, "2025-09-18": "A", "2025-09-19": "A", "2025-09-20": "A",
  "2025-09-21": "A", "2025-09-22": "A", "2025-09-23": "B", "2025-09-24": "A", "2025-09-25": "A",
  "2025-09-26": "A", "2025-09-27": "B", "2025-09-28": "B", "2025-09-29": "A", "2025-09-30": "A",

  // 10月
  "2025-10-01": "A", "2025-10-02": "A", "2025-10-03": "A", "2025-10-04": "B", "2025-10-05": null,
  "2025-10-06": "A", "2025-10-07": "A", "2025-10-08": "A", "2025-10-09": "A", "2025-10-10": "A",
  "2025-10-11": "B", "2025-10-12": null, "2025-10-13": "A", "2025-10-14": "A", "2025-10-15": null,
  "2025-10-16": "A", "2025-10-17": "A", "2025-10-18": "B", "2025-10-19": "B", "2025-10-20": "A",
  "2025-10-21": "A", "2025-10-22": "A", "2025-10-23": "A", "2025-10-24": "A", "2025-10-25": "B",
  "2025-10-26": "B", "2025-10-27": "A", "2025-10-28": "A", "2025-10-29": "A", "2025-10-30": "A", "2025-10-31": "A",

  // 11月
  "2025-11-01": "B", "2025-11-02": "B", "2025-11-03": "B", "2025-11-04": "A", "2025-11-05": "A",
  "2025-11-06": "A", "2025-11-07": "A", "2025-11-08": "B", "2025-11-09": "B", "2025-11-10": "A",
  "2025-11-11": null, "2025-11-12": "A", "2025-11-13": "A", "2025-11-14": "A", "2025-11-15": "B",
  "2025-11-16": "B", "2025-11-17": "A", "2025-11-18": "A", "2025-11-19": "A", "2025-11-20": "A",
  "2025-11-21": "A", "2025-11-22": "B", "2025-11-23": "B", "2025-11-24": "B", "2025-11-25": "A",
  "2025-11-26": "A", "2025-11-27": "A", "2025-11-28": "A", "2025-11-29": "B", "2025-11-30": "B",

  // 12月
  "2025-12-01": "A", "2025-12-02": "A", "2025-12-03": "A", "2025-12-04": "A", "2025-12-05": "A",
  "2025-12-06": "B", "2025-12-07": "B", "2025-12-08": "A", "2025-12-09": "A", "2025-12-10": "A",
  "2025-12-11": "A", "2025-12-12": "A", "2025-12-13": "B", "2025-12-14": "B", "2025-12-15": "A",
  "2025-12-16": "A", "2025-12-17": "A", "2025-12-18": "A", "2025-12-19": "A", "2025-12-20": "B",
  "2025-12-21": "B", "2025-12-22": "A", "2025-12-23": "B", "2025-12-24": "A", "2025-12-25": "A",
  "2025-12-26": null, "2025-12-27": null, "2025-12-28": null, "2025-12-29": null, "2025-12-30": null, "2025-12-31": null,

  // 1月
  "2026-01-01": null, "2026-01-02": null, "2026-01-03": null, "2026-01-04": null, "2026-01-05": null,
  "2026-01-06": null, "2026-01-07": "A", "2026-01-08": "A", "2026-01-09": "A", "2026-01-10": "B",
  "2026-01-11": "B", "2026-01-12": "B", "2026-01-13": "A", "2026-01-14": "A", "2026-01-15": "A",
  "2026-01-16": "A", "2026-01-17": "B", "2026-01-18": "B", "2026-01-19": "A", "2026-01-20": "A",
  "2026-01-21": "A", "2026-01-22": "A", "2026-01-23": "A", "2026-01-24": "B", "2026-01-25": "B",
  "2026-01-26": "A", "2026-01-27": "A", "2026-01-28": "A", "2026-01-29": "A", "2026-01-30": "A", "2026-01-31": "B",

  // 2月
  "2026-02-01": "B", "2026-02-02": "A", "2026-02-03": "A", "2026-02-04": "A", "2026-02-05": "A",
  "2026-02-06": "A", "2026-02-07": "B", "2026-02-08": "B", "2026-02-09": "A", "2026-02-10": "A",
  "2026-02-11": "B", "2026-02-12": "A", "2026-02-13": "A", "2026-02-14": "B", "2026-02-15": "B",
  "2026-02-16": "A", "2026-02-17": "A", "2026-02-18": "A", "2026-02-19": "A", "2026-02-20": "A",
  "2026-02-21": "B", "2026-02-22": "B", "2026-02-23": "A", "2026-02-24": "A", "2026-02-25": "A",
  "2026-02-26": "A", "2026-02-27": "A", "2026-02-28": "B",

  // 3月
  "2026-03-01": "B", "2026-03-02": "A", "2026-03-03": "A", "2026-03-04": "A", "2026-03-05": "A",
  "2026-03-06": "A", "2026-03-07": "B", "2026-03-08": "B", "2026-03-09": "A", "2026-03-10": "A",
  "2026-03-11": "A", "2026-03-12": "A", "2026-03-13": "A", "2026-03-14": "B", "2026-03-15": "B",
  "2026-03-16": "A", "2026-03-17": "A", "2026-03-18": "A", "2026-03-19": "A", "2026-03-20": "B",
  "2026-03-21": "B", "2026-03-22": "B", "2026-03-23": "A", "2026-03-24": "A", "2026-03-25": "A",
  "2026-03-26": "A", "2026-03-27": "A", "2026-03-28": "B", "2026-03-29": "B", "2026-03-30": "A", "2026-03-31": "A",
};

// 近鉄バスの時刻表データ
export const kintetsuBusRoutes: BusRoute[] = [
  {
    name: "八戸ノ里駅前→近畿大学東門前",
    stops: [
      {
        stopName: "八戸ノ里駅前",
        schedule: {
          A: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [0, 8, 20, 30, 40, 53] },
            { hour: 9, minutes: [3, 15, 25, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40] }
          ],
          B: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [8, 20, 40, 53] },
            { hour: 9, minutes: [15, 25, 55] },
            { hour: 10, minutes: [25, 40, 55] },
            { hour: 11, minutes: [25, 55] },
            { hour: 12, minutes: [25, 40, 55] },
            { hour: 13, minutes: [10, 40] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [25, 40] },
            { hour: 16, minutes: [10, 40, 55] },
            { hour: 17, minutes: [25, 55] },
            { hour: 18, minutes: [25] }
          ]
        }
      },
      {
        stopName: "近畿大学東門前",
        schedule: {
          A: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 16, 23, 33, 46, 56] },
            { hour: 9, minutes: [6, 16, 28, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40, 55] }
          ],
          B: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 23, 33, 56] },
            { hour: 9, minutes: [6, 28, 40] },
            { hour: 10, minutes: [10, 40, 55] },
            { hour: 11, minutes: [10, 40] },
            { hour: 12, minutes: [10, 40, 55] },
            { hour: 13, minutes: [10, 25, 55] },
            { hour: 14, minutes: [25, 40, 55] },
            { hour: 15, minutes: [10, 40, 55] },
            { hour: 16, minutes: [25, 55] },
            { hour: 17, minutes: [10, 40] },
            { hour: 18, minutes: [10, 40] }
          ]
        }
      }
    ]
  },
  {
    name: "近畿大学東門前→八戸ノ里駅前",
    stops: [
      {
        stopName: "近畿大学東門前",
        schedule: {
          A: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 16, 23, 33, 46, 56] },
            { hour: 9, minutes: [6, 16, 28, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40, 55] }
          ],
          B: [
            { hour: 7, minutes: [31, 43, 56] },
            { hour: 8, minutes: [8, 23, 33, 56] },
            { hour: 9, minutes: [6, 28, 40] },
            { hour: 10, minutes: [10, 40, 55] },
            { hour: 11, minutes: [10, 40] },
            { hour: 12, minutes: [10, 40, 55] },
            { hour: 13, minutes: [10, 25, 55] },
            { hour: 14, minutes: [25, 40, 55] },
            { hour: 15, minutes: [10, 40, 55] },
            { hour: 16, minutes: [25, 55] },
            { hour: 17, minutes: [10, 40] },
            { hour: 18, minutes: [10, 40] }
          ]
        }
      },
      {
        stopName: "八戸ノ里駅前",
        schedule: {
          A: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [0, 8, 20, 30, 40, 53] },
            { hour: 9, minutes: [3, 15, 25, 40, 55] },
            { hour: 10, minutes: [10, 25, 40, 55] },
            { hour: 11, minutes: [10, 25, 40, 55] },
            { hour: 12, minutes: [10, 25, 40, 55] },
            { hour: 13, minutes: [10, 25, 40, 55] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [10, 25, 40, 55] },
            { hour: 16, minutes: [10, 25, 40, 55] },
            { hour: 17, minutes: [10, 25, 40, 55] },
            { hour: 18, minutes: [10, 25, 40] }
          ],
          B: [
            { hour: 7, minutes: [20, 30, 43, 55] },
            { hour: 8, minutes: [8, 20, 40, 53] },
            { hour: 9, minutes: [15, 25, 55] },
            { hour: 10, minutes: [25, 40, 55] },
            { hour: 11, minutes: [25, 55] },
            { hour: 12, minutes: [25, 40, 55] },
            { hour: 13, minutes: [10, 40] },
            { hour: 14, minutes: [10, 25, 40, 55] },
            { hour: 15, minutes: [25, 40] },
            { hour: 16, minutes: [10, 40, 55] },
            { hour: 17, minutes: [25, 55] },
            { hour: 18, minutes: [25] }
          ]
        }
      }
    ]
  }
];

// パーサーのインスタンスを作成
export const kintetsuBusParser = new KintetsuBusParser();
// パース済みのデータをキャッシュ
export const parsedBusData = kintetsuBusParser.parseData(kintetsuBusCalendar, kintetsuBusRoutes);

// 日付文字列から Date オブジェクトを生成するヘルパー関数
export function parseDate(dateString: string): Date {
  const dateComponents = dateString.split('-');
  const year = parseInt(dateComponents[0]);
  const month = parseInt(dateComponents[1]);
  const day = parseInt(dateComponents[2] || '1'); // 日が省略されている場合は1日として扱う
  return new Date(year, month - 1, day);
}

// 特定の日の運行スケジュールを取得する関数
export function getBusScheduleForDate(dateString: string, stopName?: string): any {
  let date: Date;

  // 日付形式を確認して適切に処理
  if (dateString.split('-').length === 3) {
    // YYYY-MM-DD形式
    date = parseDate(dateString);
  } else {
    // 不完全な形式の場合、現在の年を使用
    const now = new Date();
    const year = now.getFullYear();
    date = parseDate(`${year}-${dateString}`);
  }

  const operationType = kintetsuBusParser.getOperationTypeForDate(kintetsuBusCalendar, date);

  if (!operationType) {
    return { date: dateString, operationType: null, message: "この日は運行していません" };
  }

  if (stopName) {
    const scheduleForStop = kintetsuBusParser.getScheduleForDate(
      kintetsuBusCalendar,
      kintetsuBusRoutes,
      date,
      stopName
    );

    if (!scheduleForStop) {
      return {
        date: dateString,
        operationType,
        error: `${stopName}の時刻表データが見つかりません`
      };
    }

    return scheduleForStop;
  }

  // 全バス停の当日スケジュールを返す
  return {
    date: dateString,
    operationType,
    stops: kintetsuBusRoutes.flatMap(route =>
      route.stops.map(stop => ({
        stopName: stop.stopName,
        routeName: route.name,
        schedule: stop.schedule[operationType]
      }))
    )
  };
}