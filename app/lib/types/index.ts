export interface TimetableEntry {
  hour: string;
  minute: string;
  destination: string;
  trainType: string;
  detailUrl: string;
}

export interface DirectionResult {
  weekday: TimetableEntry[];
  holiday: TimetableEntry[];
}

export interface StationResult {
  [directionName: string]: DirectionResult;
}

export interface ParserResult {
  [stationName: string]: StationResult;
}

export interface TimetableParser {
  name: string;
  parseUrls(urls: string[]): Promise<ParserResult>;
}