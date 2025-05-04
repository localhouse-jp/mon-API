import type { FC } from 'hono/jsx'

export interface LayoutProps {
  title: string
  children: any
  additionalStyles?: string
}

export const Layout: FC<LayoutProps> = ({ title, children, additionalStyles = '' }) => {
  return (
    <div className="layout">
      <style>{`
        .layout { max-width: 1000px; margin: 0 auto; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.9em; }
        .type-a { background-color: #e6f7ff; }
        .type-b { background-color: #fff7e6; }
        .alert { padding: 15px; border-radius: 5px; margin: 20px 0; }
        .alert-info { background-color: #e6f7ff; border: 1px solid #91d5ff; }
        .alert-danger { background-color: #fff2f0; border: 1px solid #ffccc7; }
        ${additionalStyles}
      `}</style>
      {children}
    </div>
  )
}