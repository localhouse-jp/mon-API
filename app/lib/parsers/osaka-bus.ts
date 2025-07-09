
import { osakaBusCalendar } from '../data/osaka-bus/calendar';
import { osakaBusRoutes } from '../data/osaka-bus/routes';
import { ParserResult } from '../types';

// カレンダータイプの定義（A:平日、B:休日、null:運休）
export interface BusCalendar {
  [date: string]: 'A' | 'B' | null;
}

// バススケジュールの型定義
export interface HourSchedule {
  hour: number;
  minutes: number[];
}

export interface StopSchedule {
  schedule: {
    A: HourSchedule[];
    B: HourSchedule[];
  };
  stopName: string;
}

export interface BusRoute {
  name: string;
  stops: StopSchedule[];
}

export class OsakaBusParser {
  name = 'osaka-bus';

  parseData(calendarData: BusCalendar, routeData: BusRoute[]): ParserResult {
    // 大阪バスデータをAPIのレスポンス形式に変換
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

// パーサーのインスタンスを作成
export const osakaBusParser = new OsakaBusParser();
// パース済みのデータをキャッシュ
export const parsedBusData = osakaBusParser.parseData(osakaBusCalendar, osakaBusRoutes);
