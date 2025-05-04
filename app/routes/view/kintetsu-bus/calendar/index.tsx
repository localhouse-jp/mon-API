import { FC } from 'hono/jsx'
import { Layout } from '../../../../components/Layout'
import { kintetsuBusCalendar } from '../../../../lib/api'

// カレンダーセル用のコンポーネント
interface CalendarCellProps {
  dateKey: string
  day: number
  operationType: 'A' | 'B' | null
  isToday: boolean
}

const CalendarCell: FC<CalendarCellProps> = ({ dateKey, day, operationType, isToday }) => {
  let cellClass = isToday ? 'today' : ''
  let opLabel = ''

  if (operationType === 'A') {
    cellClass += ' type-a'
    opLabel = 'A'
  } else if (operationType === 'B') {
    cellClass += ' type-b'
    opLabel = 'B'
  } else {
    cellClass += ' no-operation'
    opLabel = '×'
  }

  return (
    <td className={cellClass}>
      <a href={`/view/kintetsu-bus/calendar/${dateKey}`}>
        {day}
        <span className="op-type">{opLabel}</span>
      </a>
    </td>
  )
}

// 月ごとのカレンダーコンポーネント
interface MonthCalendarProps {
  year: number
  month: number
  currentYear: number
  currentMonth: number
  currentDay: number
}

const MonthCalendar: FC<MonthCalendarProps> = ({ year, month, currentYear, currentMonth, currentDay }) => {
  const monthKey = `${year}-${month.toString().padStart(2, '0')}`
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()

  // 月の最初の日の曜日を取得（0:日曜, 1:月曜, ..., 6:土曜）
  const dayOfWeek = firstDay.getDay()

  // カレンダーの行を生成
  const rows = []
  let dayCount = 0

  for (let i = 0; i < 6; i++) {
    const cells = []

    // 1行（7日）の生成
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < dayOfWeek) || dayCount >= daysInMonth) {
        cells.push(<td></td>)
      } else {
        dayCount++
        const dateKey = `${monthKey}-${dayCount.toString().padStart(2, '0')}`
        const operationType = kintetsuBusCalendar[dateKey]

        // 今日の日付かどうかを判定
        const isToday = (year === currentYear && month === currentMonth && dayCount === currentDay)

        cells.push(
          <CalendarCell
            dateKey={dateKey}
            day={dayCount}
            operationType={operationType}
            isToday={isToday}
          />
        )
      }
    }

    rows.push(<tr>{cells}</tr>)

    // 月のすべての日を表示したら残りの行はスキップ
    if (dayCount >= daysInMonth) break
  }

  return (
    <div className="month">
      <h3>{year}年{month}月</h3>
      <table>
        <thead>
          <tr>
            <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export default function BusCalendar() {
  // 現在の日付を取得
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

  // 各月のカレンダーを生成
  const monthCalendars = months.map(month => {
    const year = month < 4 ? 2026 : 2025  // 4月始まりの学校カレンダー

    return (
      <MonthCalendar
        year={year}
        month={month}
        currentYear={currentYear}
        currentMonth={currentMonth}
        currentDay={currentDay}
      />
    )
  })

  return (
    <Layout
      title="近鉄バス運行カレンダー"
      additionalStyles={`
        .calendar-container { display: flex; flex-wrap: wrap; justify-content: space-between; }
        .month { width: 48%; margin-bottom: 30px; }
        .month h3 { margin-top: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: center; padding: 8px; border: 1px solid #ddd; }
        td { height: 40px; position: relative; }
        td a { display: block; width: 100%; height: 100%; color: inherit; text-decoration: none; }
        .type-a { background-color: #e6f7ff; }
        .type-b { background-color: #fff7e6; }
        .no-operation { background-color: #f5f5f5; color: #999; }
        .today { outline: 2px solid #ff4d4f; font-weight: bold; }
        .legend { display: flex; gap: 20px; margin: 20px 0; }
        .legend-color { display: inline-block; width: 20px; height: 20px; vertical-align: middle; margin-right: 5px; }
        .op-type { font-size: 0.75em; position: absolute; bottom: 2px; right: 5px; }
        
        @media (max-width: 768px) {
          .month { width: 100%; }
        }
      `}
    >
      <h1>近鉄バス運行カレンダー</h1>
      <p><a href="/">← ホームに戻る</a></p>

      <div className="legend">
        <span><span className="legend-color type-a"></span>運行日（A）: 平日ダイヤ</span>
        <span><span className="legend-color type-b"></span>運行日（B）: 土曜・休日ダイヤ</span>
        <span><span className="legend-color no-operation"></span>休業日: 運行なし</span>
      </div>

      <div className="calendar-container">
        {monthCalendars}
      </div>
    </Layout>
  )
}