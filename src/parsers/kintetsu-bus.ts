// filepath: /Users/a/Documents/fun/pg/lh/research-kindai/src/parsers/kintetsu-bus.ts
import { ParserResult } from '../types';

export interface BusScheduleEntry {
  hour: number;
  minutes: number[];
}

export interface BusOperationCalendar {
  [date: string]: 'A' | 'B' | null; // 日付 -> 運行タイプ (A, B) または null（運行なし）
}

export interface BusStopSchedule {
  stopName: string;
  schedule: {
    A: BusScheduleEntry[]; // 運行日A
    B: BusScheduleEntry[]; // 運行日B
  };
}

export interface BusRoute {
  name: string;
  stops: BusStopSchedule[];
}

export class KintetsuBusParser {
  name = 'kintetsu-bus';

  parseData(calendarData: BusOperationCalendar, routeData: BusRoute[]): ParserResult {
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
  getOperationTypeForDate(calendar: BusOperationCalendar, date: Date): 'A' | 'B' | null {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayStr = String(date.getDate()).padStart(2, '0');
    const key = `${dateStr}-${dayStr}`;
    
    // 指定日の運行タイプを返す
    return calendar[key] || null;
  }
  
  // 時刻表データをAPIの形式に変換
  private convertScheduleToTimetableEntries(
    schedule: BusScheduleEntry[],
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
    calendar: BusOperationCalendar,
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
export const kintetsuBusCalendar: BusOperationCalendar = {
  "2025-04-01": "A", "2025-04-02": "A", "2025-04-03": "A", "2025-04-04": "A", "2025-04-05": "A", "2025-04-06": null,
  "2025-04-07": "A", "2025-04-08": "A", "2025-04-09": "A", "2025-04-10": "A", "2025-04-11": "A", "2025-04-12": "B", "2025-04-13": null,
  "2025-04-14": "A", "2025-04-15": "A", "2025-04-16": "A", "2025-04-17": "A", "2025-04-18": "A", "2025-04-19": "B", "2025-04-20": null,
  "2025-04-21": "A", "2025-04-22": "A", "2025-04-23": "A", "2025-04-24": "A", "2025-04-25": "A", "2025-04-26": "B", "2025-04-27": null,
  "2025-04-28": "A", "2025-04-29": null, "2025-04-30": "A",
  
  "2025-05-01": "A", "2025-05-02": "A", "2025-05-03": null, "2025-05-04": null, "2025-05-05": null, "2025-05-06": null,
  "2025-05-07": "A", "2025-05-08": "A", "2025-05-09": "A", "2025-05-10": "B", "2025-05-11": null,
  "2025-05-12": "A", "2025-05-13": "A", "2025-05-14": "A", "2025-05-15": "A", "2025-05-16": "A", "2025-05-17": "B", "2025-05-18": null,
  "2025-05-19": "A", "2025-05-20": "A", "2025-05-21": "A", "2025-05-22": "A", "2025-05-23": "A", "2025-05-24": "B", "2025-05-25": null,
  "2025-05-26": "A", "2025-05-27": "A", "2025-05-28": "A", "2025-05-29": "A", "2025-05-30": "A", "2025-05-31": "B",
  
  // 残りの月も同様に追加
  "2025-06-01": null,
  "2025-06-02": "A", "2025-06-03": "A", "2025-06-04": "A", "2025-06-05": "A", "2025-06-06": "A", "2025-06-07": "B",
  "2025-06-08": null,
  "2025-06-09": "A", "2025-06-10": "A", "2025-06-11": "A", "2025-06-12": "A", "2025-06-13": "A", "2025-06-14": "B",
  "2025-06-15": null,
  "2025-06-16": "A", "2025-06-17": "A", "2025-06-18": "A", "2025-06-19": "A", "2025-06-20": "A", "2025-06-21": "B",
  "2025-06-22": null,
  "2025-06-23": "A", "2025-06-24": "A", "2025-06-25": "A", "2025-06-26": "A", "2025-06-27": "A", "2025-06-28": "B",
  "2025-06-29": null, "2025-06-30": "A",
  
  // 7月〜3月も同様
  "2025-07-01": "A", "2025-07-02": "A", "2025-07-03": "A", "2025-07-04": "A", "2025-07-05": "B", "2025-07-06": null,
  "2025-07-07": "A", "2025-07-08": "A", "2025-07-09": "A", "2025-07-10": "A", "2025-07-11": "A", "2025-07-12": "B", "2025-07-13": null,
  "2025-07-14": "A", "2025-07-15": "A", "2025-07-16": "A", "2025-07-17": "A", "2025-07-18": "A", "2025-07-19": "B", "2025-07-20": null,
  "2025-07-21": "A", "2025-07-22": "A", "2025-07-23": "A", "2025-07-24": "A", "2025-07-25": "A", "2025-07-26": "B", "2025-07-27": "A",
  "2025-07-28": "A", "2025-07-29": "A", "2025-07-30": "A", "2025-07-31": "A"
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
            { hour: 7, minutes: [25, 40, 50] },
            { hour: 8, minutes: [05, 15, 30, 45, 55] },
            { hour: 9, minutes: [10, 20, 35, 50] },
            { hour: 10, minutes: [05, 20, 35, 50] },
            { hour: 11, minutes: [05, 20, 35, 50] },
            { hour: 12, minutes: [05, 20, 35, 50] },
            { hour: 13, minutes: [05, 20, 35, 50] },
            { hour: 14, minutes: [05, 20, 35, 50] },
            { hour: 15, minutes: [05, 20, 35, 50] },
            { hour: 16, minutes: [05, 20, 35, 50] },
            { hour: 17, minutes: [05, 20, 35, 50] },
            { hour: 18, minutes: [05, 20, 35, 50] }
          ],
          B: [
            { hour: 7, minutes: [25, 40, 50] },
            { hour: 8, minutes: [05, 15, 45] },
            { hour: 9, minutes: [00, 20, 35] },
            { hour: 10, minutes: [05, 35, 50] },
            { hour: 11, minutes: [05, 35] },
            { hour: 12, minutes: [05, 35, 50] },
            { hour: 13, minutes: [05, 20, 50] },
            { hour: 14, minutes: [20, 35, 50] },
            { hour: 15, minutes: [05, 35, 50] },
            { hour: 16, minutes: [20, 50] },
            { hour: 17, minutes: [05, 35] },
            { hour: 18, minutes: [05, 35] }
          ]
        }
      },
      {
        stopName: "八戸ノ里駅前",
        schedule: {
          A: [
            { hour: 7, minutes: [35, 50] },
            { hour: 8, minutes: [00, 15, 25, 40, 55] },
            { hour: 9, minutes: [05, 20, 30, 45] },
            { hour: 10, minutes: [00, 15, 30, 45] },
            { hour: 11, minutes: [00, 15, 30, 45] },
            { hour: 12, minutes: [00, 15, 30, 45] },
            { hour: 13, minutes: [00, 15, 30, 45] },
            { hour: 14, minutes: [00, 15, 30, 45] },
            { hour: 15, minutes: [00, 15, 30, 45] },
            { hour: 16, minutes: [00, 15, 30, 45] },
            { hour: 17, minutes: [00, 15, 30, 45] },
            { hour: 18, minutes: [00, 15, 30, 45] }
          ],
          B: [
            { hour: 7, minutes: [35, 50] },
            { hour: 8, minutes: [15, 25, 55] },
            { hour: 9, minutes: [10, 30, 45] },
            { hour: 10, minutes: [15, 45] },
            { hour: 11, minutes: [15, 45] },
            { hour: 12, minutes: [15, 45] },
            { hour: 13, minutes: [15, 30] },
            { hour: 14, minutes: [00, 30, 45] },
            { hour: 15, minutes: [15, 45] },
            { hour: 16, minutes: [00, 30] },
            { hour: 17, minutes: [15, 45] },
            { hour: 18, minutes: [15, 45] }
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
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 特定の日の運行スケジュールを取得する関数
export function getBusScheduleForDate(dateString: string, stopName?: string): any {
  const date = parseDate(dateString);
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