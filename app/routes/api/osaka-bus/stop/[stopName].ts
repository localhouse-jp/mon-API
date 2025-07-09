import { osakaBusParser } from '../../../../lib/parsers/osaka-bus';
import { osakaBusCalendar } from '../../../../lib/data/osaka-bus/calendar';
import { osakaBusRoutes } from '../../../../lib/data/osaka-bus/routes';

export const GET = async (c) => {
  const stopName = c.req.param('stopName');
  const dateParam = c.req.query('date') || new Date().toISOString().split('T')[0];

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return c.json({ error: '日付形式が正しくありません。YYYY-MM-DD形式で指定してください。' }, 400);
  }

  const date = new Date(dateParam);
  const schedule = osakaBusParser.getScheduleForDate(osakaBusCalendar, osakaBusRoutes, date, decodeURIComponent(stopName));

  return c.json(schedule);
};