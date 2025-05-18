// filepath: /Users/a/Documents/fun/pg/lh/research-kindai/src/parsers/kintetsu-bus.ts
import { kintetsuBusCalendar } from '../data/kintetsu-bus/calendar';
import { kintetsuBusRoutes } from '../data/kintetsu-bus/routes';
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
export function getBusScheduleForDate(dateString: string, stopName?: string): BusScheduleResult {
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