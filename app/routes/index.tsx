import { Layout } from '../components/Layout'

export default function Home() {
  const styles = `
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
    code { background: #eee; padding: 2px 4px; border-radius: 3px; }
    .docs-link { margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; 
                text-decoration: none; display: inline-block; border-radius: 4px; }
    .endpoint { margin: 15px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
    .method { font-weight: bold; color: #2c873a; }
    .path { font-family: monospace; }
    ul { padding-left: 20px; }
    li { margin: 5px 0; }
  `

  return (
    <Layout title="鉄道時刻表API" additionalStyles={styles}>
      <h1>鉄道時刻表API</h1>
      <p>以下のエンドポイントが利用可能です：</p>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/kintetsu</span> - 近鉄の時刻表データを取得</p>
      </div>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/jr</span> - JRの時刻表データを取得</p>
      </div>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/kintetsu-bus</span> - 近鉄バスの全時刻表データを取得</p>
        <p><a href="/view/kintetsu-bus">HTML形式で表示</a></p>
      </div>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/kintetsu-bus/calendar/:date</span> - 指定日の運行情報を取得</p>
        <p>例: <a href="/api/kintetsu-bus/calendar/2025-05-07">/api/kintetsu-bus/calendar/2025-05-07</a></p>
      </div>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/kintetsu-bus/stop/:stopName</span> - 特定のバス停の時刻表を取得</p>
        <p>例: <a href="/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07">/api/kintetsu-bus/stop/近畿大学東門前?date=2025-05-07</a></p>
      </div>

      <div className="endpoint">
        <p><span className="method">GET</span> <span className="path">/api/all</span> - すべての鉄道・バス会社のデータを統合して取得</p>
      </div>

      <h2>HTML ビュー</h2>
      <ul>
        <li><a href="/view/kintetsu-bus/calendar">近鉄バス運行カレンダー</a> - 月別カレンダー表示</li>
        <li><a href="/view/kintetsu-bus/stop/近畿大学東門前">近畿大学東門前バス停</a> - バス停の時刻表</li>
        <li><a href="/view/kintetsu-bus/stop/八戸ノ里駅前">八戸ノ里駅前バス停</a> - バス停の時刻表</li>
      </ul>

      <a href="/api-docs" className="docs-link">API ドキュメントを表示</a>
    </Layout>
  )
}