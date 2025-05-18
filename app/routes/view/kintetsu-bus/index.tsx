import { FC } from 'hono/jsx'
import { Layout } from '../../../components/Layout'
import { kintetsuBusRoutes } from '../../../lib/api'

// 時刻表コンポーネント
interface TimeTableProps {
  schedule: Array<{
    hour: number
    minutes: number[]
  }>
}

const TimeTable: FC<TimeTableProps> = ({ schedule }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>時</th>
          <th>分</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map(hour => (
          <tr key={hour.hour}>
            <td>{hour.hour}</td>
            <td>{hour.minutes.map(m => m.toString().padStart(2, '0')).join(' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// バス停情報コンポーネント
interface StopInfoProps {
  stop: {
    stopName: string
    schedule: {
      A: Array<{
        hour: number
        minutes: number[]
      }>
      B: Array<{
        hour: number
        minutes: number[]
      }>
    }
  }
  operationType: 'A' | 'B'
}

const StopInfo: FC<StopInfoProps> = ({ stop, operationType }) => {
  return (
    <div>
      <h5>{stop.stopName}</h5>
      <TimeTable schedule={stop.schedule[operationType]} />
    </div>
  )
}

// 路線情報コンポーネント
interface RouteInfoProps {
  route: {
    name: string
    stops: Array<{
      stopName: string
      schedule: {
        A: Array<{
          hour: number
          minutes: number[]
        }>
        B: Array<{
          hour: number
          minutes: number[]
        }>
      }
    }>
  }
}

const RouteInfo: FC<RouteInfoProps> = ({ route }) => {
  return (
    <div className="route-info">
      <h3>{route.name}</h3>
      <p><strong>バス停:</strong> {route.stops.map(stop => stop.stopName).join(' → ')}</p>

      <div className="type-container">
        <h4>運行日(A)時刻表</h4>
        {route.stops.map(stop => (
          <StopInfo key={stop.stopName} stop={stop} operationType="A" />
        ))}
      </div>

      <div className="type-container">
        <h4>運行日(B)時刻表</h4>
        {route.stops.map(stop => (
          <StopInfo key={stop.stopName} stop={stop} operationType="B" />
        ))}
      </div>
    </div>
  )
}

export default function KintetsuBusIndex() {
  // 重複を除いたバス停一覧を取得
  const stopNames = Array.from(
    new Set(
      kintetsuBusRoutes.flatMap(route => route.stops.map(stop => stop.stopName))
    )
  )

  return (
    <Layout
      title="近鉄バス時刻表"
      additionalStyles={`
        .container { max-width: 1200px; }
        .route-info { margin-bottom: 40px; }
        .stop-link { display: inline-block; margin: 5px 10px; padding: 5px 10px; background-color: #f0f0f0; border-radius: 5px; }
        a:hover { background-color: #e0e0e0; }
        .type-container { margin-bottom: 30px; }
      `}
    >
      <h1>近鉄バス時刻表</h1>
      <p><a href="/">← ホームに戻る</a> | <a href="/view/kintetsu-bus/calendar">運行カレンダーを見る</a></p>

      <h2>バス停一覧</h2>
      <div className="stops-list">
        {stopNames.map(stopName => (
          <a
            href={`/view/kintetsu-bus/stop/${encodeURIComponent(stopName)}`}
            className="stop-link"
            key={stopName}
          >
            {stopName}
          </a>
        ))}
      </div>

      <h2>路線情報</h2>
      {kintetsuBusRoutes.map((route, index) => (
        <RouteInfo key={index} route={route} />
      ))}
    </Layout>
  )
}