import { Context } from 'hono'
import { FC } from 'hono/jsx'
import { ErrorPage } from '../../../../components/ErrorPage'
import { Layout } from '../../../../components/Layout'
import { getBusScheduleForDate } from '../../../../lib/api'

// バス停の時刻表コンポーネント
interface StopScheduleProps {
  stop: {
    stopName: string
    routeName: string
    schedule: Array<{
      hour: number
      minutes: number[]
    }>
  }
  date: string
}

const StopSchedule: FC<StopScheduleProps> = ({ stop, date }) => {
  return (
    <div className="stop-info">
      <h3>{stop.stopName}</h3>
      <p>路線: {stop.routeName}</p>
      <table>
        <thead>
          <tr>
            <th>時刻</th>
            <th>分</th>
          </tr>
        </thead>
        <tbody>
          {stop.schedule.map(hour => (
            <tr key={hour.hour}>
              <td>{hour.hour}</td>
              <td>{hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><a href={`/view/kintetsu-bus/stop/${encodeURIComponent(stop.stopName)}?date=${date}`}>詳細を見る</a></p>
    </div>
  )
}

export default function BusDayCalendar(c: Context) {
  const date = c.req.param('date')

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <ErrorPage
        title="エラー"
        message="日付形式が正しくありません。YYYY-MM-DD形式で指定してください。"
      />
    )
  }

  const scheduleData = getBusScheduleForDate(date)
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeekJP = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()]

  return (
    <Layout
      title={`${date} 近鉄バス運行情報`}
      additionalStyles={`
        .container { max-width: 1200px; }
        .stops-container { display: flex; flex-wrap: wrap; gap: 20px; }
        .stop-info { width: calc(50% - 20px); margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
      `}
    >
      <h1>近鉄バス運行情報</h1>
      <p>
        <a href="/">← ホームに戻る</a> |
        <a href="/view/kintetsu-bus">バス時刻表一覧に戻る</a> |
        <a href="/view/kintetsu-bus/calendar">カレンダーに戻る</a>
      </p>

      {!scheduleData.operationType ? (
        <div className="alert alert-info">
          <h2>{year}年{month}月{day}日({dayOfWeekJP})の運行情報</h2>
          <p>この日は運行していません。</p>
        </div>
      ) : (
        <>
          <h2>{year}年{month}月{day}日({dayOfWeekJP})の運行情報</h2>
          <p>運行タイプ: <span className={`badge ${scheduleData.operationType === 'A' ? 'type-a' : 'type-b'}`}>
            {scheduleData.operationType === 'A' ? '平日ダイヤ (A)' : '土曜・休日ダイヤ (B)'}
          </span></p>

          <div className="stops-container">
            {scheduleData.stops.map(stop => (
              <StopSchedule
                key={stop.stopName}
                stop={stop}
                date={date}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}