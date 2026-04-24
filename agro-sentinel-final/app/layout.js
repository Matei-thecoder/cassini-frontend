import './globals.css'

export const metadata = {
  title: 'AgroSentinel — Field Intelligence Platform',
  description: 'Flood & drought detection with economic yield forecasting for precision agriculture',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grain">{children}</body>
    </html>
  )
}
