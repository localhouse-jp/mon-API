import { Context } from 'hono'
import DateSelector from '../../../../components/DateSelector'
import { ErrorPage } from '../../../../components/ErrorPage'
import { Layout } from '../../../../components/Layout'
import { getBusScheduleForDate } from '../../../../lib/api'

export default function BusStopPage(c: Context) {
  const stopName = decodeURIComponent(c.req.param('stopName'))
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]

  // 日付形式の検証（YYYY-MM-DD）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return (
      <ErrorPage
        title="エラー"
        message="日付形式が正しくありません。YYYY-MM-DD形式で指定してください。"
      />
    )
  }

  const scheduleData = getBusScheduleForDate(date, stopName)
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeekJP = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()]

  // バス停が見つからない場合のエラー表示
  if (scheduleData.error) {
    return (
      <ErrorPage
        title="エラー - バス停が見つかりません"
        message={scheduleData.error}
        statusCode={404}
      />
    )
  }

  // 運行していない日の表示
  if (!scheduleData.operationType) {
    return (
      <Layout
        title={`${stopName} - バス時刻表（運行なし）`}
        additionalStyles={`
          .container { max-width: 800px; }
          .alert-warning { background-color: #fff3cd; border: 1px solid #ffecb5; color: #856404; }
          .date-selector { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
          .date-selector select { padding: 5px; margin-right: 10px; }
        `}
      >
        <h1>{stopName} バス時刻表</h1>
        <p>{year}年{month}月{day}日({dayOfWeekJP})</p>
        <div className="alert alert-warning">
          <h2>本日は運行していません</h2>
          <p>近鉄バスは{year}年{month}月{day}日({dayOfWeekJP})は休業日のため運行していません。</p>
          <p>他の日付の時刻表を確認するには、以下のリンクをご利用ください。</p>
        </div>

        {/* 日付選択 */}
        <DateSelector year={year} month={month} day={day} stopName={stopName} />

        <p><a href="/">← ホームに戻る</a> | <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a></p>
      </Layout>
    )
  }

  // 前日と翌日の日付を計算
  const prevDate = new Date(dateObj.getTime() - 86400000).toISOString().split('T')[0]
  const nextDate = new Date(dateObj.getTime() + 86400000).toISOString().split('T')[0]

  return (
    <Layout
      title={`${stopName} - バス時刻表`}
      additionalStyles={`
        .container { max-width: 800px; }
        .hour { font-weight: bold; text-align: center; width: 60px; }
        .date-selector { margin: 20px 0; }
        .date-selector select { padding: 5px; margin-right: 10px; }
        .date-selector button { padding: 5px 10px; background-color: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer; }
        .navigate-links { display: flex; justify-content: space-between; margin: 20px 0; }
      `}
    >
      <h1>{stopName} バス時刻表</h1>
      <p>
        <a href="/">← ホームに戻る</a> |
        <a href="/view/kintetsu-bus">バス時刻表一覧に戻る</a> |
        <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a>
      </p>

      <h2>{year}年{month}月{day}日({dayOfWeekJP})</h2>

      <p>運行タイプ: <span className={`badge ${scheduleData.operationType === 'A' ? 'type-a' : 'type-b'}`}>
        {scheduleData.operationType === 'A' ? '平日ダイヤ (A)' : '土曜・休日ダイヤ (B)'}
      </span></p>
      <p>路線: {scheduleData.routeName}</p>

      {/* 日付選択 */}
      <DateSelector year={year} month={month} day={day} stopName={stopName} />

      {/* 前日・翌日リンク */}
      <div className="navigate-links">
        <a href={`/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}?date=${prevDate}`}>&lt; 前日</a>
        <a href={`/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}?date=${nextDate}`}>翌日 &gt;</a>
      </div>

      {/* 時刻表 */}
      <h3>時刻表</h3>
      <table>
        <thead>
          <tr>
            <th>時</th>
            <th>分</th>
          </tr>
        </thead>
        <tbody>
          {scheduleData.schedule.map(hour => (
            <tr key={hour.hour}>
              <td className="hour">{hour.hour}</td>
              <td className="minutes">{hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>※道路状況によりバスの到着が遅れることがございますので、ご了承くださいますようお願い申し上げます。</p>
    </Layout>
  )
}