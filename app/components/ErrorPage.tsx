import type { FC } from 'hono/jsx'
import { Layout } from './Layout'

export interface ErrorPageProps {
  title: string
  message: string
  statusCode?: number
}

export const ErrorPage: FC<ErrorPageProps> = ({ title, message, statusCode = 500 }) => {
  return (
    <Layout
      title={title}
      additionalStyles={`
        .alert-danger { background-color: #fff2f0; border: 1px solid #ffccc7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      `}
    >
      <h1>{title}</h1>
      <div class="alert alert-danger">
        <p>{message}</p>
        <p><a href="/">← ホームに戻る</a></p>
      </div>
    </Layout>
  )
}